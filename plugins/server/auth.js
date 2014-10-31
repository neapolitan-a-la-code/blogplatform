var Routes = require("./routes");
var credentials = require('./credentials.js');

exports.register = function(plugin, options, next) {
    
    //Add Multiple strategies here and we have used confidence to pick up the configuration.
    plugin.auth.strategy('facebook', 'bell', {
	    provider: 'facebook',
	    password: 'hapiauth',
	    clientId: credentials.facebook.clientId,
	    clientSecret: credentials.facebook.clientSecret,
	    isSecure: false
    });

    plugin.auth.strategy('google', 'bell', {
        provider: 'google',
        password: 'hapiauth',
        clientId: credentials.google.clientId,
        clientSecret: credentials.google.clientSecret,
        isSecure: false
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