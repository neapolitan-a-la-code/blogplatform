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