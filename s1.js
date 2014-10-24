var Hapi = require('hapi');
var routes = require("./routes/routes.js");
var server = Hapi.createServer('localhost',8080);
var dbOpts = {
    "url": "mongodb://neapolitan:pebblesmo0@linus.mongohq.com:10081/neapolitan1",
    "settings": {
        "db": {
            "native_parser": false
        }
    }
};


// function pullEntries(req, res, callback) {
//     if (typeof req.server.plugins['hapi-mongodb']== 'undefined') return;
// 		var db = req.server.plugins['hapi-mongodb'].db;
// 		var collection = db.collection('posts');
// 		//console.log("in pullEntries");
// 		collection.find().sort({ "id": -1}).toArray(function (err, docs) {
// 		if(err) callback(err, null);
// 		entdata = docs;
// 		callback (null, docs);
// 	}
// )};

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