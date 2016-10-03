var config      = require('./lib/config-load')();
var ActionDelegator      = require('./lib/action-delegator');
var Jar      = require('./lib/jar');
var Botkit = require('botkit');
var os = require('os');




const clientSecret = config.SLACK_CLIENT_SECRET;
const clientId = config.SLACK_CLIENT_ID;
const port = config.PORT;
const host = config.HOST_URI;
const slackToken = config.SLACK_TOKEN;

if (!clientSecret || !clientId || !port) {
  console.log('Error: Specify clientId clientSecret and port in environment');
  process.exit(1);
}
var controller = Botkit.slackbot({
  debug: true,
  json_file_store: './db_slackbutton_slashcommand/',
}).configureSlackApp({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: `https://${host}/oauth`,
    scopes: ['commands', 'bot']
});

const bot = controller.spawn({
    token: slackToken
}).startRTM()



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
const jar = Jar();

const addCommand = function(bot, message, action) {
  jar.add(action.content)
  const jarIndex = jar.count();
  bot.replyPrivate(message, `You put *'${action.content}'* in the jar. You can remove it by calling 
    \`/jar remove ${jarIndex}\`, or see all items with \`/jar check\``);
}

const listAllJarItems = function(jarItems) {
  var replyStr = '';
  if(jarItems.length > 0) {
    replyStr = `Here's what's in the jar: \n`
    for(var item of jarItems) {
      var idx = jarItems.indexOf(item) + 1;
      replyStr += `${idx}) ${item} \n`;
    }
  } else {
    replyStr = `Jar's empty, things must be going pretty good!`
  }
  return replyStr;
}

actionDelegator.addAction('add', addCommand);
actionDelegator.addAction('default', addCommand);

actionDelegator.addAction('remove', function(bot, message, action) {
  const itemIdx = action.arguments[0] - 1; // Public facing indexes are 1 based
  const item = jar.get(itemIdx);
  const removeSuccess = jar.remove(itemIdx);
  var replyStr = '';

  if (removeSuccess) {
    replyStr = `Took *'${item}'* out of the jar.`;
  } else {
    const jarItems = jar.get();
    replyStr = `Whoops, I don't have that item. ${listAllJarItems(jarItems)}`;
  }

  bot.replyPrivate(message, replyStr);
});

actionDelegator.addAction('empty', function(bot, message) {
  bot.replyPrivate(message, `:boom: Clearing out the Jar :boom:`);
  jar.empty();
});

actionDelegator.addAction('check', function(bot, message) {
  const jarItems = jar.get();
  bot.replyPrivate(message, listAllJarItems(jarItems));
});

controller.on('slash_command', function (bot, message) {
  actionDelegator.delegate(bot, message);
});