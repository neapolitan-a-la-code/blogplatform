//authentication here
var Hoek = require("hoek");
var Routes = require("../routes/routes.js");

exports.register = function(plugin, options, next) {
    
    //Add Multiple strategies here and we have used confidence to pick up the configuration.
    plugin.auth.strategy('facebook', 'bell', {
	    provider: 'facebook',
	    password: 'hapiauth',
	    clientId: '', // fill in your FB ClientId here
	    clientSecret: '', // fill in your FB Client Secret here
	    isSecure: false // Terrible idea but required if not using HTTPS
    });

    //plugin.auth.strategy('google', 'bell', Providers.google);

    plugin.auth.strategy('session', 'cookie', {
        password: 'hapiauth', // give any string you think is right password to encrypted
        cookie: 'sid-hapiauth', // cookie name to use, usually sid-<appname>
        redirectTo: '/',
        isSecure: false,
        validateFunc: function(session, callback) {
            cache.get(session.sid, function(err, cached) {

                if (err) {
                    return callback(err, false);
                }

                if (!cached) {
                    return callback(null, false);
                }

                return callback(null, true, cached.item.account);
            });
        }
    });
    //Added a separate file for just routes.
    plugin.route(Routes);
    next();
};