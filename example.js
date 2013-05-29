var le = require('./lib/Emitter'),
	express = require('express');

var lucidGREP = le(server)
	.on('error', console.error.bind(console));

var httpPort = 3000;

// Process command line arguments
var arg, factory;
for (var i = 2; i < process.argv.length; i++) {
	arg = process.argv[i];
	switch(arg) {
		case '-p':
		case '--port':
			httpPort = process.argv[++i];
			continue;
		case '-t':
			factory = require('./lib/examples/test');
			arg = process.argv[++i];
			break;
		case '-u':
		case '--udp4':
			factory = require('./lib/examples/udp4');
			arg = process.argv[++i];
			break;
		case '-f':
		default:
			factory = require('./lib/examples/tail');
	}
	lucidGREP.listen(factory(arg));
}

// Serve up the client-side resources
var app = express()
	.use('/', express.static(__dirname + '/client'));

// Set up the HTTP server
var server = require('http').createServer(app)
	.listen(httpPort);

// Serve up client-side socket.io resources
require('socket.io')
	.listen(server)
	.on('connection', lucidGREP.pipe.bind(lucidGREP));
