#!/usr/bin/env node
/**
		lucidtail
		i.e. lucidtail file*.log --udp4 514 -p 8080
		Copyright (C) 2013	David Duong

		https://github.com/davidnqd/lucidtail

		This program is free software: you can redistribute it and/or modify
		it under the terms of the GNU Affero General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version.

		This program is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
		GNU Affero General Public License for more details.

		You should have received a copy of the GNU Affero General Public License
		along with this program.	If not, see <http://www.gnu.org/licenses/>.
*/

var lucidtail = require('../lib/');

// Create aggregate emitter
var emitter = lucidtail.Aggregator()
	.on('error', console.error.bind(console));

// Specify command line arguments
var optimist = require('optimist')
    .usage('Simple, zero-configuration websocket tail\nUsage: $0 [options] [file ...]')

    .alias('h', 'help')
    .alias('h', '?')
    .boolean('h')
    .default('h', false)
    .describe('h', 'Show this help')

    .alias('p', 'http_port')
    .describe('p', 'Specify the http port lucidtail services')
    .default('p', 8080)

    .alias('u', 'udp4')
    .describe('u', 'Emit incoming UDP messages on the specified port')

    .alias('t', 'test')
    .describe('t', 'Emit a test log message every second with the specified source name');

// Add Test listener
if (optimist.argv.test) {
	var arg = optimist.argv.test === true? 'Test' : optimist.argv.test;
	console.log('Registering test emitter with name', arg);
	emitter.listen('test', optimist.argv.test);
}

// Add UDP4 listener
if (optimist.argv.udp4) {
	console.log('Listening to UDP4 port', optimist.argv.udp4);
	try {
		emitter.listen('udp4', optimist.argv.udp4);
	} catch (e) {
		console.error('Invalid --port argument:', e.message);
	}
}

// Add file listeners
for (var i = 0; i < optimist.argv._.length; i++) {
	console.log('Tailing file', optimist.argv._[i]);
	try {
		emitter.listen('tail', optimist.argv._[i]);
	} catch (e) {
		console.error('Invalid --file argument:', e.message);
	}
}

// Show usage if insufficient arguments
if (optimist.argv.help) {
	optimist.showHelp();
	process.exit(1);
}

// Serve up the client-side resources
var express = require('express');
var app = express()
	.use('/', express.static(__dirname + '/../client'));

// Configure express if NODE_ENV=production
app.configure('production', function(){
  app.use(express.errorHandler());
});

// Set up the HTTP server
var server = require('http').createServer(app)
	.listen(optimist.argv.http_port);

// Serve up client-side socket.io resources
var io = require('socket.io')
	.listen(server)
	.on('connection', emitter.pipe.bind(emitter));

// Configure socket.io if NODE_ENV=production
io.configure('production', function(){
	io.enable('browser client minification');  // send minified client
	io.enable('browser client etag');          // apply etag caching logic based on version number
	io.enable('browser client gzip');          // gzip the file
	io.set('log level', 1);                    // reduce logging

	// enable all transports (optional if you want flashsocket support, please note that some hosting
	// providers do not allow you to create servers that listen on a port different than 80 or their
	// default port)
	io.set('transports', [
		'websocket'
		, 'htmlfile'
		, 'xhr-polling'
		, 'jsonp-polling'
	]);
});