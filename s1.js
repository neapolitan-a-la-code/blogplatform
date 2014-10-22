var Hapi = require('hapi');
var Joi = require('joi');
var mongodb = require('mongodb');

var dbOpts = {
    "url": "mongodb://neapolitan:pebblesmo0@linus.mongohq.com:10081/neapolitan1",
    "settings": {
        "db": {
            "native_parser": false
        }
    }
};

var MongoClient = mongodb.MongoClient;
var dbAddy = "mongodb://neapolitan:pebblesmo0@linus.mongohq.com:10081/neapolitan1";

var entdata;
var maxid = 0;

function getLowID() {
 	MongoClient.connect(dbAddy, function (err, db) {
    	var collection = db.collection('posts');
    	collection.find().sort({"id": -1}).limit(1).toArray(function (err, docs) {
      		maxid = docs[0].id;
      		maxid++;
    	});
  	});
}

getLowID();

function pullPosts() {
	MongoClient.connect(dbAddy, function (err, db) {
		var collection = db.collection('posts');
		collection.find().sort({ "id": -1}).toArray(function (err, docs) {
			entdata = docs;
		});
	});
}

// SERVER 1
var server = Hapi.createServer('localhost',8080);

server.views({
	engines: {
		jade: require("jade")
	},
	path: "./views"
});

server.route({
	method: 'GET',
	path: '/articles',
	handler: function (request, reply) {
		reply.view ('entlanding', {
			"entriesData" : entdata
		});
		pullPosts();	
	}
});

server.route({
	method: 'GET',
	path: '/articles/new',
	handler : {
		file: "new.html"
	}
});

server.route({
	method: 'POST',
	path: '/articles/new',
  	handler: function (request, reply) {
    	MongoClient.connect(dbAddy, function (err, db) {
      		var collection = db.collection('posts');
      		var newEntry = {
        		id: maxid,
		        date: "22102014",
		        name: request.payload.author,
		        text: request.payload.entry
			};
			collection.insert(newEntry, function(err,data) {
		  		if(err) console.log(err);
			  	reply("ok");
			  	pullPosts();
			  	maxid++;
	  		});
		});
	},
});

server.route({
	method: 'GET',
	path: '/articles/{id}',
	handler: function (request, reply) {
		reply('You asked for the page ' + request.params.id);
	},
	config: {
		validate: {
			params: {
				id: Joi.string().required()
			}
		}
	}
});
		
server.route({
	method: 'GET',
	path: '/articles/{id}/delete',
	handler: function (req, reply) {
		MongoClient.connect(dbAddy, function (err, db) {
	      	var collection = db.collection('posts'); 
		    collection.remove({ "id": Number(req.params.id)}, function(err, data){
		      	if (err) return reply(Hapi.error.internal("Internal MongoDB error", err));
				reply(data);
		    })  
		})
	}
});

server.route({
	method: 'GET',
	path: '/articles/{id}/edit',
	handler: {
		file: "edit.html"
	},
});

server.start(function(err,data) {
  pullPosts();
});