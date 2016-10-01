var path = require('path');

module.exports = function loadConfig() {

  var public_config   = require(path.resolve(__dirname, '../config/default'));

  var private_config;
  try {
    private_config  = require(path.resolve(__dirname, '../config/local'));
  }
  catch(e) {
    private_config = {};
  }

  // add environment variables as overriding factors
  for (var property in process.env) {
      if (process.env.hasOwnProperty(property)) {
        private_config[property] = process.env[property];
          // do stuff
      }
  }

  return Object.assign({}, public_config, private_config);
}