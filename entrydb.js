
var http = require('http');
var mongodb = require('mongodb');
//var collName = "posts";

var MongoClient = mongodb.MongoClient;

var dbAddy = "mongodb://neapolitan:pebblesmo0@linus.mongohq.com:10081/neapolitan1";
//var dbAddy = process.env.MONGOHQ_URL;



function pullPosts() {

MongoClient.connect(dbAddy, function(err, db) {
  var collection = db.collection('posts');
          collection.find().sort({ "id": -1}).toArray(function (err, docs) {
          console.log(docs);
          });
    });
}

var entry = {"id": 999, "date":"21102014", "name":"joe","text":"sushi"};


function storePost() {

MongoClient.connect(dbAddy, function(err, db) {
  var collection = db.collection('posts');
          collection.insert(entry, function(err,data) {
            if(err) console.log(err);
          });
        

}
)}

storePost();

