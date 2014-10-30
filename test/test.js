
var Lab = require('lab');
var lab = exports.lab = Lab.script(); 
var Code = require('code');
var expect = Code.expect;
var Hapi = require('hapi');
var http = require('http');

lab.test('basic test', function(done) {

        var handler = function () {
        	reply('hello');
            throw new Error('never called');
        };

        var server = new Hapi.Server();
        server.route({ method: 'GET', path: '/articles', config: { handler: handler } });

        server.start(function () {

                var options = {
                    hostname: '127.0.0.1',
                    port: server.info.port,
                    path: '/',
                    method: 'GET'
                };
            var req = Http.request(options, function(res) {
            	   expect(res.result).to.exist();
			        expect(res.result.statusCode).to.equal(500);
			        done();

            });

            req.once('error', function (err) {
            	done();
            });

            req.end();

         
        });
    });
