var Joi = require('joi');
var Hapi = require('hapi');

var entdata;
var maxid = 0;

function pullEntries(req, res, callback) {
    if (typeof req.server.plugins['hapi-mongodb']=== 'undefined') return;
		var db = req.server.plugins['hapi-mongodb'].db;
		var collection = db.collection('posts');
		//console.log("in pullEntries");
		collection.find().sort({ "id": -1}).toArray(function (err, docs) {
			if(err) callback(err, null);
			entdata = docs;
			callback (null, docs);
		}
)};

var currentDate = function () {
    var today = new Date ();
    return(
    	('0' + today.getDate()).slice(-2) +
		('0' + (today.getMonth()+1)).slice(-2) +
    	today.getFullYear()
    );
}; //this returns a string

module.exports = {
		
		loadEntry: {
			directory: {
            	path: 'public'
            	,
            	listing: true
			}
		},

		pullEntries: function (request, reply) {
			pullEntries(request, reply, function(err, result){
				if(typeof entdata =='undefined') ('DB connection failure. Using a free sandbox? Cheapskate');
				else {
					reply.view ('entlanding', {
					"entriesData" : entdata
					});
				}
			})
		},

		pushEdit: function (request, reply) {
			var db = request.server.plugins['hapi-mongodb'].db;
	        var collection = db.collection('posts');
	        var editEntry = {
	            id: Number(request.params.id),
	            date: request.payload.date,
	            name: request.payload.author,
	            text: request.payload.entry
	        };
        
        	collection.update({ id: editEntry.id }, editEntry, { upsert: true}, function(err,data) {
            	if(err) console.log(err);
      
           		reply.redirect('/articles');
        	});
		},

		getView: function (request, reply) {
			reply.view ('new', {
			});
		},

		newEntry: function (request, reply) {
			var db = request.server.plugins['hapi-mongodb'].db;
	  		var collection = db.collection('posts');
	  		collection.find().sort({"id": -1}).limit(1).toArray(function (err, docs) {
	      		maxid = docs[0].id;
	      		maxid++;
			
		  		var newEntry = {
		    		id: maxid,
			        date: currentDate(),
			        name: request.payload.author,
			        text: request.payload.entry
			     };

				collection.insert(newEntry, function(err,data) {
			  		if(err) console.log(err);
				  	reply.redirect('/articles');
				});
			});
		},

		// validateNewEntry: function (request, reply) {
		// 	payload: {
		// 		id: Joi.number().integer().min(1).max(100),
		// 		date: Joi.date().min('20102014').max('31122060'),
		// 		author: Joi.string().min(2).max(10).required(),
		// 		entry: Joi.string().min(2).max(50).required()
		// 	}
		// },

		getArticle: function (request, reply) {
			reply('You asked for the page ' + request.params.id);

		},

		deleteArticle: function (request, reply) {
			var db = request.server.plugins['hapi-mongodb'].db;
	      	var collection = db.collection('posts');
		    collection.remove({ "id": Number(request.params.id)}, function(err, data){
		      	if (err) return reply(Hapi.error.internal("Internal MongoDB error", err));
				reply.redirect('/articles');
		    });
		},

		editArticle: function (request, reply) {
			var db = request.server.plugins['hapi-mongodb'].db;
	      	var collection = db.collection('posts');
		    collection.find({ "id": Number(request.params.id)}).toArray(function(err, thisEntry){
		      	if (err) return reply(Hapi.error.internal("Internal MongoDB error", err));
		        reply.view ('edit2', {
			        "entry" : thisEntry
		        });
		    });
		},

		viewArticle: function (request, reply) {
			var db = request.server.plugins['hapi-mongodb'].db;
		      	var collection = db.collection('posts');
			    collection.find({ "id": Number(request.params.id)}).toArray(function(err, thisEntry){
			      	if (err) return reply(Hapi.error.internal("Internal MongoDB error", err));
			        reply.view ('view', {
				        "entry" : thisEntry
			        });
			    });
		}	
}		
