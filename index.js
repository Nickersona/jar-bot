var config      = require('./lib/config-load')();
var Botkit = require('botkit');
var os = require('os');



const clientSecret = config.Jar.slackAPI.clientSecret;
const clientId = config.Jar.slackAPI.clientId;
const port = config.Jar.port;

if (!clientSecret || !clientId || !port) {
  console.log('Error: Specify clientId clientSecret and port in environment');
  process.exit(1);
}

var controller = Botkit.slackbot({
  json_file_store: './db_slackbutton_slashcommand/',
}).configureSlackApp({
    clientId: clientId,
    clientSecret: clientSecret,
    scopes: ['commands'],
});


var controller = Botkit.slackbot({
    debug: true
});
// receive outgoing or slash commands
// if you are already using Express, you can use your own server instance...
// see "Use BotKit with an Express web server"
controller.setupWebserver(port,function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver);
});

controller.on('slash_command',function(bot,message) {
  // reply to slash command
  bot.replyPublic(message,'Everyone can see the results of this slash command');

});
