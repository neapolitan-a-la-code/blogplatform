var entdata;
var maxid = 0;

function pullEntries (req, res, callback) {
    if (typeof req.server.plugins['hapi-mongodb']=== 'undefined') return;
	var db = req.server.plugins['hapi-mongodb'].db;
	var collection = db.collection('posts');

	collection.find().sort({ "id": -1}).toArray(function (err, docs) {
		if(err) callback(err, null);
		entdata = docs;
		callback (null, docs);
	});
}

function pullUsers (req, res, callback) {
	var db = req.server.plugins['hapi-mongodb'].db;
	var allUsers = db.collection('users');

	allUsers.find({admin: false}).toArray(function (err, users) {
		if(err) callback(err, null);

		totalUsers = users;
		callback (null, users);
	});
}

var currentDate = function () {
    var today = new Date ();
    return(
    	('0' + today.getDate()).slice(-2) +
		('0' + (today.getMonth()+1)).slice(-2) +
    	today.getFullYear()
    );
};

module.exports = {

	pullEntries: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
		var users = db.collection('users');

		pullEntries(request, reply, function (err, result){

			if (typeof entdata =='undefined') {
				reply('DB connection failure. Using a free sandbox? Cheapskate');
			}

			if (request.auth.isAuthenticated) {

				var username = (request.auth.credentials.sid).split("=;").pop();
				users.find({username: username}).toArray(function (err, result) {

					if (result[0] !== undefined && result[0].admin) {
						reply.view('entlandingAdmin', {
							"entriesData" : entdata,
							"username" : username
						});
					} else {
						reply.view('entlandingloggedin', {
							"entriesData" : entdata,
							"username" : username
						});
					}
				});
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

	entryView: function (request, reply) {

		var username = (request.auth.credentials.sid).split("=;").pop();
		console.log(username);

		reply.view ('new', {
			"username" : username
		});
	},


	entryCreate: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
  		var collection = db.collection('posts');

  		collection.find().sort({"id": -1}).limit(1).toArray(function (err, posts) {
      		maxid = posts[0].id;
      		maxid++;
		
	  		var newEntry = {
	    		id: maxid,
		        date: currentDate(),
		        name: request.payload.author,
		        text: request.payload.entry,
		        comments: [],
		        clength: 0
		     };

			collection.insert(newEntry, function (err,data) {
		  		if(err) console.log(err);
			  	reply.redirect('/articles');
			});
		});
	},

	accidentalPage: function (request, reply) {
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
      	var users = db.collection('users');

      	var username = (request.auth.credentials.sid).split("=;").pop();

		users.find({username: username}).toArray(function (err, result) {

			console.log(result[0].admin);

	      	if (result[0].admin) {
	      		collection.find({ "id": Number(request.params.id)}).toArray(function(err, thisEntry){
			      	if (err) return reply(Hapi.error.internal("Internal MongoDB error", err));
			        reply.view ('edit2', {
				        "entry" : thisEntry,
				        "username" : username
			        });
		    	});
	      	} else {
					reply("sorry, this page isn't for you!");
			}
		});
	},


	viewArticle: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
		var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

      	var collection = db.collection('posts');
      	var users = db.collection('users');

	    collection.find({ "id": Number(request.params.id)}).toArray(function (err, thisEntry){
	      	if (err) return reply(Hapi.error.internal("Internal MongoDB error", err));

	      	if (request.auth.isAuthenticated) {
	      		var username = (request.auth.credentials.sid).split("=;").pop();
	      		reply.view ('viewloggedin', {
		        	"entry" : thisEntry,
		        	"username" : username
		        });
	      	} else {
		        reply.view ('view', {
			        "entry" : thisEntry
	          	});
	        }
	    });
	},

	viewComments: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
      	var collection = db.collection('posts');
	    collection.find({ "id": Number(request.params.id)}).toArray(function (err, thisEntry){
	      	if (err) return reply(Hapi.error.internal("Internal MongoDB error", err));
	        reply.view ('comments', {
		        "entry" : thisEntry
	        });
	    });
	},

	searchView: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
		var users = db.collection('users');
		if (request.auth.isAuthenticated) {

			var username = (request.auth.credentials.sid).split("=;").pop();
			users.find({username: username}).toArray(function (err, result) {

				if (result[0] !== undefined && result[0].admin) {
					reply.view('searchAdmin', {
						"username" : username
					});
				} else {
					reply.view('searchloggedin', {
						"username" : username
					});
				}
			});
		} else {
			reply.view('search', {});
		}
	},

	createComments: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
		var collection = db.collection('posts');

		var username = (request.auth.credentials.sid).split("=;").pop();

		if (request.auth.isAuthenticated) {
			var newComments = {
	    		id: "",
		        date: currentDate(),
		        name: request.payload.commentname,
		        text: request.payload.commenttext
		     };

			collection.find({ "id": Number(request.params.id)}).toArray(function (err, thisEntry){
				newComments.id = thisEntry[0].comments.length;
				thisEntry[0].comments.push(newComments);
      			thisEntry[0].clength = thisEntry[0].comments.length;

				collection.update({ "id": Number(request.params.id)}, thisEntry[0], function (err, result) {
					if (err) reply ("DB ERROR... sorry");
					if (result) reply.view ('view', {
						"entry" : thisEntry,
						"username" : username
					});
				});
			});
		} else {
			reply ("Sorry, please login to continue" + 
  					"<form class='form' name='input' action='/articles/login'>" +
  					"<input type='submit' value='Try Again!'></form>");
		}
	},

	searchArticles: function (request, reply) {
    	var db = request.server.plugins['hapi-mongodb'].db;
		var collection = db.collection('posts');
		collection.find({"text": {$regex : request.payload.searchfor}}).toArray(function (err, posts) {
           if(err) console.log(err);
           
           reply.view ('entlanding', {
                  "entriesData" : posts,
			});
        });
    },

    facebookLogin: function (request, reply) {
    	
    	var account = request.auth.credentials;
    	var sid = account.profile.id;

    	request.auth.session.set({
    		sid: sid + "=;" + account.profile.displayName
    	});
    	reply.redirect('/articles');
    },

    googleLogin: function (request, reply) {
    	var account = request.auth.credentials;
    	var sid = account.profile.id;

    	request.auth.session.set({
    		sid: sid + "=;" + account.profile.displayName
    	});
    	reply.redirect('/articles');
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
  				reply("#sns, those logins don't exist!" +
  					"<form class='form' name='input' action='/articles/login'>" +
  					"<input type='submit' value='Try Again!'></form>");
  			} else {

  				if (request.payload.password === result[0].password) {
	  				request.auth.session.set({
	  					sid: sid + "=;" + request.payload.username
	  				});
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
		reply.view ('signup');
	},

	loginCreate: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
  		var users = db.collection('users');

  		users.find({username: request.payload.username}).toArray(function (err, result) {
  			if (err) console.log("something wrong with handler loginCreate");
  			if (result[0] !== undefined) {
  				reply ("Username already Taken");
  			} else {
  				var newlogin = {
		    		username: request.payload.username,
			        password: request.payload.password,
			        admin: false
	     		};
	 
				users.insert(newlogin, function (err) {
			  		if(err) console.log(err);
				  	reply.redirect('/articles/login');
				});
  			}
		});
	},

	adminPage: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
  		var users = db.collection('users');

		var username = (request.auth.credentials.sid).split("=;").pop();

		users.find({username: username}).toArray(function (err, result) {

			if (result[0].admin) {
				pullUsers(request, reply, function (err, result){
					if (err) reply ("problem with pull users funtion!");
					if(typeof totalUsers =='undefined') {
						reply('DB connection failure. Using a free sandbox? Cheapskate');
					} else {
						reply.view ('admin', {
							"totalUsers" : totalUsers,
							"username" : username
						});
					}
				});
			} else {
				reply("sorry, this page isn't for you!");
			}

		});
	},

	makeAdmin: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
		var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
  		var users = db.collection('users');

		users.find({ "_id": ObjectID(request.params._id)}).toArray(function (err, thisUser){
	      	if (err) return reply(Hapi.error.internal("Internal MongoDB error", err));
	      		
      		users.update({_id : ObjectID(thisUser[0]._id)}, { $set: { admin: true } }, { upsert: true }, function (err,data) {
	        	if(err) console.log(err);
	  
	       		reply.redirect('/admin');
	    	});
	    });
	},

	userDelete: function (request, reply) {
		var db = request.server.plugins['hapi-mongodb'].db;
		var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
  		var users = db.collection('users');

  		users.remove({ "_id": ObjectID(request.params._id)}, function (err, data){
	      	if (err) return reply(Hapi.error.internal("Internal MongoDB error", err));

			reply.redirect('/admin');
	    });
	},

	logout: function (request, reply) {
	    request.auth.session.clear();
	    return reply.redirect('/');
	}
};