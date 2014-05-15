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
var spawn = require('child_process').spawn,
	Lazy = require('lazy');

/**
 * Example demonstrating creating an emitter which uses `tail`
 * TODO: Implement using native node
 */
module.exports = function (options) {
	options = options || {};
	if (typeof options === 'string') {
		options = { file: options };
	} else if (!options.file && !options.args) {
		throw new Error('File not specified');
	}

	var args = options.args || ['-q', '-n', 0, '-F', options.file];
	var tail = spawn('tail', args);

	var result = Lazy(tail.stdout)
		.lines
		.map(function (data) {
			return { data: String(data), source: 'file://' + options.file };
		});

	tail.on('error', result.emit.bind(result, 'error'))
		.on('close', function (code) {
			result.emit('error', 'tail (' + options.file + ') process exited with code: ' + code);
		});
	tail.stderr.on('error', result.emit.bind(result, 'error'));

	return result;
};
