module.exports = {
  // Customer module configs
  Jar : {
    slackAPI: {
      clientId: "86372351042.86357809904",
      secret: "THIS SHOULD BE OVERRIDDEN BY ENV VARS"
    },
    dbConfig: {
      host: "localhost",
      port: 5984,
      dbName: "jar-bot"
    }
  }
}