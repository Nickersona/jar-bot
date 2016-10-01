var config      = require('./lib/config-load')();
var Botkit = require('botkit');
var os = require('os');




const clientSecret = config.SLACK_CLIENT_SECRET;
const clientId = config.SLACK_CLIENT_ID;
const port = config.PORT;
const host = config.HOST_URI;

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
    scopes: ['commands']
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

controller.on('slash_command',function(bot,message) {
  console.log(arguments)
  // reply to slash command
  bot.replyPublic(message,'Everyone can see the results of this slash command');

});