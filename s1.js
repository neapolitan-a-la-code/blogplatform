var Hapi = require('hapi');
var routes = require("./routes/routes.js");
var server = Hapi.createServer(Process.env.PORT || 8080);
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

server.pack.register({
    plugin: require('hapi-mongodb'),
    options: dbOpts
}, function (err) {
    if (err) {
        console.error(err);
        throw err;
    }
});

server.start(function(err,data) {
	routes.forEach(function(route){
	server.route(route);
	})
});