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
    MongoClient.connect(dbAddy, function(err, db) {
    var collection = db.collection('posts');
    collection.find().sort({"id":-1}).limit(1).toArray(function (err, docs) {
            maxid = docs[0].id;
            console.log(docs[0].id);
            maxid++;
            });
});
}

getLowID();
  
function pullPosts() {

MongoClient.connect(dbAddy, function(err, db) {
  var collection = db.collection('posts');
          collection.find().sort({ "id": -1}).toArray(function (err, docs) {
          entlanding = docs;
          });
    });
}
pullPosts();
      

    
    var server = Hapi.createServer('localhost', Number(process.argv[2] || 8080));

    server.route({
    method: 'GET',
    path: '/articles',
    config: {
        handler: function (request, reply) {
            pullPosts();
            reply(entlanding);
          },
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
    })
    
    
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

    




    
    var server2 = Hapi.createServer('localhost', 9090, {
      cors:true
    });
    
    server2.route({
      method: 'POST',
      path: '/articles/new',
      config: {
      handler: function (request, reply) {
       // if(err){
        //  console.log(request);
      //  }

      
      

MongoClient.connect(dbAddy, function(err, db) {
  var collection = db.collection('posts');
  

            console.log(maxid);
                    
          var newEntry = {
          id: maxid,
          date: "21102014",
          name: request.payload.author,
          text: request.payload.entry
          };
  
          collection.insert(newEntry, function(err,data) {
            if(err) console.log(err);
            
            reply("ok");
            pullPosts();
            maxid++;
            
          }
          );
        }
)}
      }})
      
      

      
  /*
    var server3 = Hapi.createServer('localhost', 7070, {
      cors:true
    });
    
    server3.route({
      method: 'GET',
      path: '/articles/new',
      config: {
      handler: function (request, reply) {
       // if(err){
        //  console.log(request);
      //  }
        
      var newEntry = {
      author: request.payload.author,
      entry: request.payload.entry
      };
      
      
      fs.appendFile('entries.txt', newEntry.author + " : " + newEntry.entry + "<br>");
      //reply("uploaded");
      
    
       
      }
      }});
      
      */
    
    /*
    server2.route({
    method: 'POST',
    path: '/write',
    config: {
        handler: function (request, reply) {
            
            
           //querystring.parse('foo=bar&baz=qux&baz=quux&corge')
           console.log("got kicked");
           fs.appendFile('entries.txt', "adam");
           reply("uploaded");
        },
        }
    });
  */
    server2.start(function(){
//    console.log("9090 server running");
      });
    
    
