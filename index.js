var Hapi = require('hapi');
var Good = require('good');
// var routes = require("./routes/routes.js");

var server = Hapi.createServer(process.env.PORT || 8080, {
    debug: {
        request: ['error']
    }
});

var dbOpts = {
    "url": "mongodb://neapolitan:pebblesmo0@linus.mongohq.com:10081/neapolitan1",
    "settings": {
        "db": {
            "native_parser": false
        }
    }
};

var goodOpts = {
    extendedRequests: true,
    logRequestHeaders: true,
    //logRequestPayload: true,
    //logResponsePayload: true,
    opsInterval: 1000,
    reporters: [{
        reporter: Good.GoodConsole
    }, {
        reporter: Good.GoodFile,
        args: ['./fixtures/log_awesome', {
            events: {
                ops: '*'
            }
        }]
    }, {
        reporter: require('good-http'),
        args: ['http://localhost:8081', {
            events: {
                error: '*',
                ops: '*'
            },
            threshold: 500,
            wreck: {
                headers: { 'x-api-key' : 12345 }
            }
        }]
    // }, {
    //     reporter: require('good-console')
    }]
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
    { plugin: require('hapi-mongodb'), options: dbOpts},
    { plugin: require('good'), options: goodOpts},
    { plugin: require('./plugins/server')}], function (err) {
    if (err) throw err;
    server.route([{
        path: '/',
        method: 'GET',
        config: {  // try with redirectTo disabled makes isAuthenticated usefully available
            auth: {
                strategy: 'session',
                mode: 'try'},
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        },
        handler: function (request, reply) {
            reply.redirect ("/articles");
        }
    }]);
});

server.start(function (err) {
    if (err) {
        console.log('error message ' + err);
    }
    console.log('Hapi server started @ ' + server.info.uri);
});

// server.start(function(err,data) {
// 	routes.forEach(function(route){
// 	server.route(route);
// 	});
// });