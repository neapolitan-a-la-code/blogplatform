var Joi = require('joi');

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
		});
}

var currentDate = function () {
    var today = new Date ();
    return(
    	('0' + today.getDate()).slice(-2) +
		('0' + (today.getMonth()+1)).slice(-2) +
    	today.getFullYear()
    );
}; //this returns a string

module.exports = {

	pullEntries: function (request, reply) {
		pullEntries(request, reply, function(err, result){
			if(typeof entdata =='undefined') {
				reply('DB connection failure. Using a free sandbox? Cheapskate');
			} else {
				reply.view ('entlanding', {
					"entriesData" : entdata
				});
			}
		});
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
	},

	searchView: function (request, reply) {
		reply.view('search', {});
	},

	searchArticles: function (request, reply) {
    	var db = request.server.plugins['hapi-mongodb'].db;
		var collection = db.collection('posts');
		collection.find({"text": {$regex : request.payload.searchfor}}).toArray(function (err, docs) {
           if(err) console.log(err);
           
           reply.view ('entlanding', {
                  "entriesData" : docs
			});
        });
    },

    facebookLogin: function (request, reply) {
    	var account = request.auth.credentials;
    	var sid = account.profile.id;

    	request.auth.session.set({
    		sid: sid
    	});
    	return reply.redirect('/articles');
    },

    loginView: function (request, reply) {
		reply.view ('login', {
		});
	},

	login: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
		var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
  		var users = db.collection('users');

  		users.find({username: request.payload.username}).toArray(function (err, result) {
  			var sid = ObjectID().toHexString();

  			if (err) {
  				console.log("error with login handler");
  			}

  			if (result[0] === undefined) {
  				reply("Sorry, those logins don't exist!" + 
  					"<form class='form' name='input' action='/articles/login'>" +
  					"<input type='submit' value='Try Again!'></form>");
  			} else {

  				if (request.payload.password === result[0].password) {
	  				request.auth.session.set({sid: sid});
	    			reply.redirect('/articles');

	  			} else {
	  				reply("sorry, wrong password" +
	  					"<form class='form' name='input' action='/articles/login'>" +
  						"<input type='submit' value='Try Again!'></form>");
	  			}
  			}
  		});
	},

	signupView: function (request, reply) {
		reply.view ('signup', {});
	},

	loginCreate: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
  		var collection = db.collection('users');
  		//to make new logins

  		collection.find({username: request.payload.username}).toArray(function (err, result) {
  			if (err) console.log("something wrong with handler loginCreate");
  			if (result[0] !== undefined) {
  				reply ("Username already Taken");
  			} else {
  				var newlogin = {
		    		username: request.payload.username,
			        password: request.payload.password,
			        admin: false
	     		};
	     		console.log(newlogin);
				collection.insert(newlogin, function (err) {
			  		if(err) console.log(err);
				  	reply.redirect('/articles/login');
				});
  			}
		});
	},

	logout: function (request, reply) {
	    request.auth.session.clear();
	    return reply.redirect('/');
	}
};