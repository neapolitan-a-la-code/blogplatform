var Hapi = require('hapi');
var Joi = require('joi');


var dbOpts = {
    "url": "mongodb://neapolitan:pebblesmo0@linus.mongohq.com:10081/neapolitan1",
    "settings": {
        "db": {
            "native_parser": false
        }
    }
};

var entdata;
var maxid = 0;

function pullEntries(req, res, callback) {
		var db = req.server.plugins['hapi-mongodb'].db;
		var collection = db.collection('posts');
		//console.log("in pullEntries");
		collection.find().sort({ "id": -1}).toArray(function (err, docs) {
		if(err) callback(err, null);
		entdata = docs;
		callback (null, docs);
	}
)}

var currentDate = function () {
    var today = new Date ();
    return(
    	('0' + today.getDate()).slice(-2) + '-' +
		('0' + (today.getMonth()+1)).slice(-2) + '-' +
    	today.getFullYear()
    );
};//this returns a string

var server = Hapi.createServer('localhost',8080);

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

server.pack.register({
    plugin: require('hapi-mongodb'),
    options: dbOpts
}, function (err) {
    if (err) {
        console.error(err);
        throw err;
    }
});

server.route({
	method: 'GET',
	path: '/articles',
	handler: function (request, reply) {
		pullEntries(request, reply, function(err, result){
		//console.log("callback received");
		if(err) ('Patience is Key. Please refresh');
		else {
			reply.view ('entlanding', {
			"entriesData" : entdata
		});
		}
	
		}
	)}
});

server.route({
    method: 'POST',
    path: '/articles/{id}/edit/push',
     handler: function (request, reply) {
         //console.log(request.params.id);
         var db = request.server.plugins['hapi-mongodb'].db;
             var collection = db.collection('posts');
             var editEntry = {
               id: Number(request.params.id),
                date: request.payload.currentDate(),
                name: request.payload.author,
                text: request.payload.entry
             };
            collection.update({ id: editEntry.id }, editEntry, { upsert: true}, function(err,data) {
                  if(err) console.log(err);
                  //reply("ok");
                 reply.redirect('/articles');
              });
    },
});

server.route({
	method: 'GET',
	path: '/articles/new',
	handler: function (request, reply) {
		reply.view ('new', {
		});
	}
});

server.route({
	method: 'POST',
	path: '/articles/new/create',
  	handler: function (request, reply) {
  		var db = request.server.plugins['hapi-mongodb'].db;
  		var collection = db.collection('posts');
  		collection.find().sort({"id": -1}).limit(1).toArray(function (err, docs) {
      		maxid = docs[0].id;
      		maxid++;
		
	  		var newEntry = {
	    		id: maxid,
		        date: currentDate(),
		        author: request.payload.author,
		        entry: request.payload.entry
		     };

			collection.insert(newEntry, function(err,data) {
		  		if(err) console.log(err);
			  	reply.redirect('/articles');
			});
		});
	},
	config: {
		validate: {
			payload: {
				id: Joi.number().integer().min(1).max(100).required(),
				date: Joi.date().min('20-10-2014').max('31-12-2060'),
				author: Joi.string().min(2).max(10).required(),
				entry: Joi.string().min(2).max(50).required()
			}
		}
	}
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
	handler: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
	      	var collection = db.collection('posts');
		    collection.remove({ "id": Number(request.params.id)}, function(err, data){
		      	if (err) return reply(Hapi.error.internal("Internal MongoDB error", err));
				reply.redirect('/articles');
		    });
	}
});

//Almost working. "Just needs a couple more lines" - Adam
server.route({
	method: 'GET',
	path: '/articles/{id}/edit',
	handler: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
	      	var collection = db.collection('posts');
		    collection.find({ "id": Number(request.params.id)}).toArray(function(err, thisEntry){
		      	if (err) return reply(Hapi.error.internal("Internal MongoDB error", err));
		        reply.view ('edit2', {
			        "entry" : thisEntry
			    //reply(thisEntry);
		        });
		    });
	}
});


server.start(function(err,data) {
});