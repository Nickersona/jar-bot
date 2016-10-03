var localtunnel = require('localtunnel');
var config      = require('./lib/config-load')();
var open = require('open');

const hostURI = config.HOST_URI;
const domainsArr = hostURI.split('.')

var tunnel = localtunnel(config.PORT, {subdomain: domainsArr[0]}, function(err, tunnel) {
    if (err)
    	console.log(err);

    open(tunnel.url);
});
 
tunnel.on('close', function() {
    // tunnels are closed 
});