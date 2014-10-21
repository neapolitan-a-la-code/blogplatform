    var Hapi = require('hapi');
    var fs = require('fs');
    var Joi = require('joi');
    //var jade = require('jade');
    var viewoptions = {
        engines: {
          jade: require("jade")
        },
        path: "./views"
    };

    var server = Hapi.createServer('localhost', 8090);

    server.views(viewoptions);

    server.route({
    method: 'GET',
    path: '/articles',
    config: {
        handler: function (request, reply) {
          fs.readFile("entries.txt", "utf8", function (error, data) {
            //reply('This is where we view all entries: <br>'+
            //data);
            reply.view ("layout", {
              first: "Dan",
              last: "Sofer",
              colour: "green",
              post: data
            })
          })

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
    })
    
    
    server.route({
        method: 'GET',
        path: '/articles/{id}/edit',
        config: {
            handler: function (request, reply) {
                reply('You want to edit ' + request.params.id +', ja? ');
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
        
      var newEntry = {
      author: request.payload.author,
      entry: request.payload.entry
      };
      
      
      fs.appendFile('entries.txt', newEntry.author + " : " + newEntry.entry + "<br>");
      //reply("uploaded");
      
    
       
      }
      }});
    
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
    console.log("9090 server running");
      });
    
    
