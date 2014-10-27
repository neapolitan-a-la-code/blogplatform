var Hapi = require('hapi');
var routes = require("./routes/routes.js");
var server = Hapi.createServer(process.env.PORT || 8080);

var dbOpts = {
    "url": "mongodb://neapolitan:pebblesmo0@linus.mongohq.com:10081/neapolitan1",
    "settings": {
        "db": {
            "native_parser": false
        }
    }
};

server.views({
	engines: {
		jade: require("jade")
	},
	path: "./views"
});

server.pack.register([
    { plugin: require('bell')},
    { plugin: require('hapi-auth-cookie')},
    { plugin: require('hapi-mongodb'), options: dbOpts },
    { plugin: require('./auth/auth.js')}
], function (err) {
    if (err) throw err;
    server.route([{
        path: '/',
        method: 'GET',
        config: {  // try with redirectTo disabled makes isAuthenticated usefully available
            auth: {
                strategy: 'session',
                mode: 'try'},
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }},
        handler: function (request, reply) {
            reply.view('index', {
                auth: JSON.stringify(request.auth),
                session: JSON.stringify(request.session),
                isLoggedIn: request.auth.isAuthenticated
            });
        }
    }, {
        path: '/{path*}',
        method: 'GET',
        handler: {
            directory: {
                path: './public',
                listing: false,
                index: true
            }
        }
    }]);
});

server.start(function(err,data) {
	routes.forEach(function(route){
	server.route(route);
	});
});