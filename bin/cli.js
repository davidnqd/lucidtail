#!/usr/bin/env node
/**
		lucidtail
		ie. lucidtail *.log
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

// Specify command line arguments
var optimist = require('optimist')
    .usage('A real-time zero-configuration web-based tail\nUsage: $0 [options] [file ...]')

    .alias('h', 'help')
    .alias('h', '?')
    .boolean('h')
    .default('h', false)
    .describe('h', 'Show this help')

    .alias('p', 'http_port')
    .describe('p', 'Specify the http port lucidtail services. (0 = random port)')
    .default('p', process.env.PORT || 8080)

    .describe('http_host', 'Specify the http host lucidtail services')

    .alias('u', 'udp4')
    .describe('u', 'Emit incoming UDP messages on the specified port')

    .alias('d', 'demo')
    .describe('d', 'Emit a demo message every half-second with the specified source name')

    .alias('m', 'mongodb')
    .describe('m', 'Use the mongodb database specified at the given url')

    .alias('o', 'of')
    .describe('o', 'Broadcast on a given socket.io namespace.');

// Show usage
if (optimist.argv.help) {
	optimist.showHelp();
	process.exit(0);
}

// require lucidtail
var lucidtail = require('../lib');
var options = {of: optimist.argv.of};

var server = Number(optimist.argv.http_port);
console.log('Using port:', server);
if (optimist.argv.http_host) {
	server = require('http').createServer(lucidtail.client())
		.listen(server, optimist.argv.http_host);
}

if (optimist.argv.mongodb) {
	console.log('Recognized --mongodb:', optimist.argv.mongodb);
	options.emitter = lucidtail.emitter('mongodb', optimist.argv.mongodb);
}

var emitter = lucidtail(server, options);

// Use UDP4 listener
if (optimist.argv.udp4) {
	console.log('Recognized --udp4:', optimist.argv.udp4);
	emitter.listen(require('../lib/in/udp4')(optimist.argv.udp4));
}

// Use file listeners
for (var i = 0; i < optimist.argv._.length; i++) {
	console.log('Recognized --file:', optimist.argv._[i]);
	emitter.listen(require('../lib/in/tail')(optimist.argv._[i]));
}

console.log('Listeners registered: ' + emitter.emitterCount());
if (emitter.emitterCount() === 0 || optimist.argv.demo) {
	if (optimist.argv.demo) {
		console.log('Recognized --demo');
	} else {
		console.log('No emitter configured, using \'demo\'.');
	}
	emitter.listen(require('../lib/in/demo')());
}
