var Hapi = require('hapi');
var fs = require('fs');
var Joi = require('joi');
var http = require('http');
var mongodb = require('mongodb');
var Path = require ('path');
//var collName = "posts";

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
//var dbAddy = process.env.MONGOHQ_URL;

var entdata;
var maxid = 0;

function getLowID() {
 	MongoClient.connect(dbAddy, function (err, db) {
    	var collection = db.collection('posts');
    	collection.find().sort({"id": -1}).limit(1).toArray(function (err, docs) {
      		maxid = docs[0].id;
      		//console.log(docs[0].id);
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
			//console.log("pulled posts OK");
			//console.log(entdata);
		});
	});
}

// SERVER 1

var server = Hapi.createServer('localhost',8080);
//var server4 = new Hapi.Server(8081);

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            listing: true
        }
    }
});

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
			reply.view ('entlanding', {
				"entriesData" : entdata
			});
			//pullPosts();	
			}
		}
	});
  		
	


server.route({
	method: 'GET',
	path: '/articles/new',
	handler : function (request, reply) {
		reply.view ('newposts', {
			title: "Add new user"
		});
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

server.start(function(err,data) {
  pullPosts();
});


// SERVER 2
var server2 = Hapi.createServer('localhost', 9090, {
	cors:true
});

server2.route({
	method: 'POST',
	path: '/articles/new',
  	handler: function (request, reply) {
    	MongoClient.connect(dbAddy, function (err, db) {
      		var collection = db.collection('posts');
      		//console.log(maxid);
      		var newEntry = {
        		id: maxid,
		        date: "22102014",
		        name: request.payload.author,
		        text: request.payload.entry
		    };
		    //entries.push(newEntry);
		    //reply(entries);
		    collection.insert(newEntry, function(err,data) {
	  			if(err) console.log(err);
		  		reply("ok");
		  		pullPosts();
		  		maxid++;
  			});
		});
	},/*
	config: {
    	validate: {
      		payload: Joi.object({
		        id: Joi.number().integer().min(1).max(10).required(),
		        date: Joi.date().min(20-10-2014).required(),
		        name: Joi.string().alphanum().min(2).max(39).required(),
		        text: Joi.string().alphanum().min(10).max(200).required()
		    })
    	}
	}*/
});

server2.start(function(){
//    console.log("9090 server running");
});