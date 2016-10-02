var localtunnel = require('localtunnel');
var config      = require('./lib/config-load')();
var open = require('open');


var tunnel = localtunnel(config.PORT, {subdomain: 'jarbot'}, function(err, tunnel) {
    if (err)
    	console.log(err);

    open(tunnel.url);
});
 
tunnel.on('close', function() {
    // tunnels are closed 
});