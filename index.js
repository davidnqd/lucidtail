var le = require('./lib/Emitter'),
	express = require('express')
	Lazy = require('lazy');

var lucidGREP = le(server)
	.on('error', console.error.bind(console));

var httpPort = 3000;

// Get config from command line
var arg;
for (var i = 2; i < process.argv.length; i++) {
	arg = process.argv[i];
	switch(arg) {
	case '-p':
		httpPort = process.argv[++i];
		break;
	case '-s':
		var SyslogUDP = require('./lib/SyslogUDP');
		var emitter = new SyslogUDP(process.argv[++i]);
		lucidGREP.listen(emitter);
		break;
	default:
		var Tail = require('./lib/Tail');
		var emitter = Lazy(new Tail(arg))
						.lines
						.map(String)
						.map(function (line) {
							return { data: line, source: arg };
						});
		lucidGREP.listen(emitter);
		break;
	}
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
