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

function currentDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  
  if(dd<10) {
      dd='0'+dd;
  }
  
  if(mm<10) {
      mm='0'+mm;
  }

  dd = dd.toString();
  mm = mm.toString();
  yyyy = yyyy.toString();
  
  var todaystring = dd+mm+yyyy;
  return todaystring;
}

var server = Hapi.createServer('localhost',8080);

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
		var db = request.server.plugins['hapi-mongodb'].db;
		var collection = db.collection('posts');
		collection.find().sort({ "id": -1}).toArray(function (err, docs) {
			entdata = docs;
		});
		if(typeof entdata !== 'undefined') {
			reply.view ('entlanding', {
			"entriesData" : entdata
		});
		} else {
			reply ('Patience is Key. Please refresh')
		}
	}
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
                date: currentDate(),
                name: request.payload.author,
                text: request.payload.entry
             };
            collection.update({ id: editEntry.id }, editEntry, { upsert: true}, function(err,data) {
                  if(err) console.log(err);
                  //reply("ok");
                 reply.redirect('/articles');
                  maxid++;
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
    		});
      		var newEntry = {
        		id: maxid,
		        date: currentDate(),
		        name: request.payload.author,
		        text: request.payload.entry
		     };
		     //console.log("some fish");
			collection.insert(newEntry, function(err,data) {
		  		if(err) console.log(err);
			  	//reply("ok");
			  	
			  	reply.redirect('/articles');
			  	maxid++;
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
	// server.inject('http://localhost:8080/articles', function(request,reply){
	 //	console.log('injected')
	
		function getLowID() {

 			MongoClient.connect(dbAddy, function (err, db) {
    			var collection = db.collection('posts');
    			collection.find().sort({"id": -1}).limit(1).toArray(function (err, docs) {
		      		maxid = docs[0].id;
		      		maxid++;
    			});
    		})
		}

		getLowID();
	//});
})