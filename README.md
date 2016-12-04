# Overview 

Slack integration to anonomusly store retrospective items until the end of the sprint 
when they can be reviewd, kept, or cleared as they're addressed 

## Features
- /jar [add] command to add a comment to the Jar 
- /jar empty command to remove all items from the Jar
- /jar remove (<index>) command to remove a specific item from the Jar
- /jar check  command to list every item in the Jar
- One Jar per Channel. Create a team specific channel to get your own Jar!
- Duplication protection. Jarbot add the same item twice to a channel jar

# How to dev
Get the server running locally:
- Open two terminal windows, in the first run `npm start` in the second `npm run dev`. First command starts the app, second exposes it publically so we can OAuth with slack's bot server
- That will give you a public url. Hit that and see if you get the `Howdy!` landing page. Save that URL for later
- startup mongod by running mongod in the root dir. This should be running at `mongodb://localhost:27017`
Create a Jarbot App:
- Go to slack.com, create a new slack just for you, And create a bot at https://api.slack.com/apps
- Create A slash command, call it /jar and point it's Request URL to your publicly running instance +'/slack/receive' default is `https://jarbot.localtunnel.me/slack/receive`
- Set the Oauth Permissions Redirect URL to your public instance: http://jarbot.localtunnel.me/
- grab your secret key from the basic Information panel and throw it in `/config/local.js`

```
module.exports = {
  // Customer module configs
  PORT : 3000,
  SLACK_CLIENT_ID: "YOUR CLIENT ID",
  SLACK_CLIENT_SECRET: "YOUR SECRET",
  HOST_URI: "jarbot.localtunnel.me",
  MONGODB_URI: "mongodb://localhost:27017",
}

```

OK time to install the bot to your slack.  Hit `https://jarbot.localtunnel.me/login` to begin the OAuth handshake with slack. If it's working, you should be prompted to login to slack, choose the room and grant permissions. If the app works correctly, you should be redirected back to https://jarbot.localtunnel.me and it should say "Success!"

There! you should be able to run the command ou defined in the app config on the api.slack.com interface.