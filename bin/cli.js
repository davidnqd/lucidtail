#!/usr/bin/env node
/**
		webtail file*.log --udp4 514 -p 8080
		Copyright (C) 2013	David Duong

		https://github.com/davidnqd/webTAIL

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

// Create aggregate emitter
var emitter = require('../lib/Aggregator')()
	.on('error', console.error.bind(console));

// Specify command line arguments
var optimist = require('optimist')
    .usage('Usage: $0 [-p|--http_port] [port] ')

    .alias('p', 'http_port')
    .describe('p', 'Specify the http port webtail services')
    .default('p', 8080)

    .alias('u', 'udp4')
    .describe('u', 'Listens to a UDP port')

    .alias('t', 'test')
    .describe('t', 'Emits a test log message every second');

var factory;

// Add Test listener
if (optimist.argv.test) {
	var arg = optimist.argv.test === true? 'Test' : optimist.argv.test;
	console.log('Registering test emitter with name', arg);
	factory = require('../lib/in/test');
	emitter.listen(factory(arg));
}

// Add UDP4 listener
if (optimist.argv.udp4) {
	try {
		console.log('Listening to UDP4 port', optimist.argv.udp4);
		factory = require('../lib/in/udp4');
		emitter.listen(factory(optimist.argv.udp4));
	} catch (e) {
		console.warn('Invalid --port argument:', e.message);
	}
}

// Add file listeners
for (var i = 0; i < optimist.argv._.length; i++) {
	if (factory == null)
		factory = require('../lib/in/tail');
	try {
		console.log('tailing file', optimist.argv._[i]);
		emitter.listen(factory(optimist.argv._[i]));
	} catch (e) {
		console.warn('Invalid --file argument:', e.message);
	}
}

// Show usage if insufficient arguments
if (factory == null) {
	optimist.showHelp();
	process.exit(1);
}

// Serve up the client-side resources
var express = require('express');
var app = express()
	.use('/', express.static(__dirname + '/../client'));

// Set up the HTTP server
var server = require('http').createServer(app)
	.listen(optimist.argv.http_port);

// Serve up client-side socket.io resources
require('socket.io')
	.listen(server)
	.on('connection', emitter.pipe.bind(emitter));
