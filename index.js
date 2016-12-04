var config      = require('./lib/config-load')();
var Botkit = require('botkit');
var BotkitStorageMongo = require('botkit-storage-mongo');
var os = require('os');

var ActionDelegator      = require('./lib/action-delegator');
var Jar      = require('./lib/mongo-jar');


const clientSecret = config.SLACK_CLIENT_SECRET;
const clientId = config.SLACK_CLIENT_ID;
const port = config.PORT;
const host = config.HOST_URI;
const mongoUri = config.MONGODB_URI;

if (!clientSecret || !clientId || !port) {
  console.log('Error: Specify clientId clientSecret and port in environment');
  process.exit(1);
}

const mongoStorage = BotkitStorageMongo({ mongoUri: mongoUri });

var controller = Botkit.slackbot({
  debug: true,
  storage: mongoStorage,
}).configureSlackApp({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: `https://${host}/oauth`,
    scopes: ['commands', 'bot']
});

// receive outgoing or slash commands
// if you are already using Express, you can use your own server instance...
// see "Use BotKit with an Express web server"
controller.setupWebserver(port,function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver);
  controller.createHomepageEndpoint(controller.webserver)
  controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

const actionDelegator = ActionDelegator();
const jar = new Jar(controller);

const strings = {
  err: {
    general: 'We\'re having some technical difficulties, who knew a Jar would be so complicated',
    dupe: 'Looks like I\'ve already got that item.',
  },
}

const addCommand = function(bot, message, action) {
  jar.add(message, action.content).then(function(allItems){
    const jarIndex = allItems.length
    bot.replyPrivate(message, `You put *'${action.content}'* in the jar. You can remove it by calling 
      \`/jar remove (${jarIndex})\`, or see all items with \`/jar check\``);
  }).catch(function(err){
    switch(err.name) {
    case 'DupeError':
      bot.replyPrivate(message, strings.err.dupe);
    default:
      bot.replyPrivate(message, strings.err.general);
      break;
    }
  });
}

const listAllJarItems = function(jarItems) {
  var replyStr = '';
  if(jarItems.length > 0) {
    replyStr = `Here's what's I got: \n`
    for(var item of jarItems) {
      var idx = jarItems.indexOf(item) + 1;
      replyStr += `*${idx})* ${item} \n`;
    }
  } else {
    replyStr = `I got nothing, things must be going pretty good!`
  }
  return replyStr;
}

// Set the add command as the default action. So it'll be called with /jar
actionDelegator.addAction('add', addCommand);
actionDelegator.addAction('default', addCommand);

actionDelegator.addAction('remove', function(bot, message, action) {
  const itemIdx = action.arguments[0] - 1; // Public facing indexes are 1 based
  
  jar.get(message).then(function(items){
    const removedItem = items[itemIdx]; // Setting this here because the remove method
    // updates the items object in memory
    jar.remove(message, itemIdx).then(function(removeSuccess){
      var replyStr = '';
      if (removeSuccess) {
        replyStr = `Took *'${removedItem}'* out of the Jar.`;
      } else {
        replyStr = `Whoops, I don't have that item. ${listAllJarItems(items)}`;
      }
      bot.replyPrivate(message, replyStr);
    });
  });
});

actionDelegator.addAction('empty', function(bot, message) {
  bot.replyPrivate(message, `:boom: Clearing out the Jar :boom:`);
  jar.empty(message);
});

actionDelegator.addAction('check', function(bot, message) {
  jar.get(message).then(function(jarItems){
    bot.replyPrivate(message, listAllJarItems(jarItems));
  }).catch( function(reason) {
        console.log('Handle rejected promise ('+reason+') here.');
        bot.replyPrivate(message, strings.err.general);
  });
});

controller.on('slash_command', function (bot, message) {
  console.log(message)
  actionDelegator.delegate(bot, message);
});