//authentication here
//var Hoek = require("../node_modules/hapi/node_modules/hoek");
var Routes = require("./routes");
var credentials = require('./credentials.js');

exports.register = function(plugin, options, next) {
    
    //Add Multiple strategies here and we have used confidence to pick up the configuration.
    plugin.auth.strategy('facebook', 'bell', {
	    provider: 'facebook',
	    password: 'hapiauth',
	    clientId: credentials.facebook.clientId, // fill in your FB ClientId here
	    clientSecret: credentials.facebook.clientSecret, // fill in your FB Client Secret here
	    isSecure: false // Terrible idea but required if not using HTTPS
    });

    plugin.auth.strategy('google', 'bell', {
        provider: 'google',
        password: 'hapiauth',
        clientId: credentials.google.clientId, // fill in your FB ClientId here
        clientSecret: credentials.google.clientSecret, // fill in your FB Client Secret here
        isSecure: false // Terrible idea but required if not using HTTPS
    });

    plugin.auth.strategy('session', 'cookie', {
        password: 'hapiauth', // give any string you think is right password to encrypted
        cookie: 'sid-neapblog', // cookie name to use, usually sid-<appname>
        redirectTo: '/articles/login',
        isSecure: false,
    });
    //Added a separate file for just routes.
    plugin.route(Routes);
    next();
};

exports.register.attributes = {
    pkg: require("./package.json")
};