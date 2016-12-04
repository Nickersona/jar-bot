var config      = require('./config-load')();
const debugMode = config.DEBUG_MODE;

module.exports = {
	log: function() {
		debugMode && console.log.apply(console, arguments);
	}
};