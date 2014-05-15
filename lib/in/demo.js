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
var EventEmitter = require('events').EventEmitter;

/**
 * Example demonstrating creating an emitter which sends a test messages every second
 */
module.exports = function (name) {
	var result = new EventEmitter();
	var message = [
					'This lucidTAIL instance is configured to listen to nothing;',
					'but, instead of nothing, lucidTAIL will broadcast this message.',
					'lucidTAIL is a real-time zero-configuration web-based tail.',
					'It broadcasts events such as new lines added to any monitored files, new UDP messages, and those emitted by other EventEmitters to your browser using WebSockets (if available)',
					'.. as you can clearly see.',
					'Homepage: https://github.com/davidnqd/lucidtail',
					'Not sure what else to put here..'
				];

	var i = 0;
	setInterval(function() {
		result.emit('data', {data: message[i++ % message.length], source: name, 'key': 'your custom value', 'line': i});
	}, 1000);

	return result;
};
