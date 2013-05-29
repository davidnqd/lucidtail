// Create aggregate emitter
var emitter = require('./lib/AggregateEmitter')()
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
	emitter.listen(factory(arg));
}

// Serve up the client-side resources
var express = require('express');
var app = express()
	.use('/', express.static(__dirname + '/client'));

// Set up the HTTP server
var server = require('http').createServer(app)
	.listen(httpPort);

// Serve up client-side socket.io resources
require('socket.io')
	.listen(server)
	.on('connection', emitter.pipe.bind(emitter));
