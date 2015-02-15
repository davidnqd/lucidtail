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
var Lazy = require('lazy');

/**
 * Example demonstrating creating an emitter which sends a test messages every second
 */
module.exports = function (name) {
	var result = new EventEmitter();
	process.stdin.setEncoding('utf8');

	Lazy(process.stdin)
		.lines
		.map(String)
		.map(function (line) {
			result.emit('data', {data: line, source: 'Standard Input (stdin)'});
		});

	return result;
};
