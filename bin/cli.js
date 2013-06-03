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

// Specify command line arguments
var optimist = require('optimist')
    .usage('A real-time zero-configuration web-based tail\nUsage: $0 [options] [file ...]')

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

// Show usage
if (optimist.argv.help) {
	optimist.showHelp();
	process.exit(1);
}

var lucidtail = require('../lib');

// Create aggregate emitter
var emitter = new lucidtail(optimist.argv.http_port)
	.on('error', console.error.bind(console));

// Use Test listener
if (optimist.argv.test) {
	var arg = optimist.argv.test === true? 'Test' : optimist.argv.test;
	console.log('Recognized --test:', arg);
	try {
		emitter.listen(lucidtail.createEmitter('test', optimist.argv.test));
	} catch (e) {
		console.error('Invalid argument (--test):', e.message);
	}
}

// Use UDP4 listener
if (optimist.argv.udp4) {
	console.log('Recognized --udp4:', optimist.argv.udp4);
	try {
		emitter.listen(lucidtail.createEmitter('udp4', optimist.argv.udp4));
	} catch (e) {
		console.error('Invalid argument (--port):', e.message);
	}
}

// Use file listeners
// FIXME: Use a native approach instead of tail: e.g. fs.watch
for (var i = 0; i < optimist.argv._.length; i++) {
	console.log('Recognized --file:', optimist.argv._[i]);
	try {
		emitter.listen(lucidtail.createEmitter('tail', optimist.argv._[i]));
	} catch (e) {
		console.error('Invalid argument (--file):', e.message);
	}
}