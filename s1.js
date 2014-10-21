var Hapi = require('hapi');
var fs = require('fs');
var Joi = require('joi');
var http = require('http');
var mongodb = require('mongodb');
//var collName = "posts";

var MongoClient = mongodb.MongoClient;
var dbAddy = "mongodb://neapolitan:pebblesmo0@linus.mongohq.com:10081/neapolitan1";
//var dbAddy = process.env.MONGOHQ_URL;

var entlanding;
var maxid = 0;

function getLowID() {
  MongoClient.connect(dbAddy, function (err, db) {
    var collection = db.collection('posts');
    collection.find().sort({"id": -1}).limit(1).toArray(function (err, docs) {
      maxid = docs[0].id;
      console.log(docs[0].id);
      maxid++;
    });
  });
}

getLowID();

function pullPosts() {
  MongoClient.connect(dbAddy, function (err, db) {
		var collection = db.collection('posts');
			collection.find().sort({ "id": -1}).toArray(function (err, docs) {
				entlanding = docs;
			});
	});
}

pullPosts();



// SERVER 1

var server = Hapi.createServer('localhost', Number(process.argv[2] || 8080));

server.views({
	engines: {
		jade: require("jade")
	},
	path: "./views"
});

server.route({
method: 'GET',
path: '/articles',
config: {
	handler: function (request, reply) {
		pullPosts();
		MongoClient.connect(dbAddy, function(err, db) {
			var collection = db.collection('posts');
			collection.find().sort({ "id": -1}).toArray(function (err, docs) {
				reply.view ('entlanding', {
					"entlanding" : docs
				});
      });
    });
	}
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
	method: 'GET',
	path: '/articles/{id}',
	config: {
		handler: function (request, reply) {
			reply('You asked for the page ' + request.params.id);
		},
		validate: {
			params: {
				id: Joi.string().required()
			}
		}
	}
});


server.route({
	method: 'GET',
	path: '/articles/{id}/edit',
	config: {
		handler: {
			file: "edit.html"
		},
	}
});


server.start();

// SERVER 2 

var server2 = Hapi.createServer('localhost', 9090, {
	cors:true
});

server2.route({
	method: 'POST',
	path: '/articles/new',
	config: {
  	handler: function (request, reply) {
  		MongoClient.connect(dbAddy, function (err, db) {
  			var collection = db.collection('posts');
  			console.log(maxid);								
  			var newEntry = {
  				id: request.payload.id,
  				date: request.payload.date,
          name: request.payload.name,
          text: request.payload.text
  			};
        entries.push(newEntry);
        reply(entries);

        validate: {
          payload: Joi.object({
            id: Joi.number().integer().min(1).max(10).required(),
            date: Joi.date().min(20-10-2014).required(),
            name: Joi.string().alphanum().min(2).max(39).required(),
            text: Joi.string().alphanum().min(10).max(200).required()
          });
        }

  			collection.insert(newEntry, function(err,data) {
  				if(err) console.log(err);
  				reply("ok");
  				pullPosts();
  				maxid++;
  			});
  		});
  	};
	};
});

	server2.start(function(){
//    console.log("9090 server running");
	});