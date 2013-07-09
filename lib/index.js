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

function lucidtail (server, opts) {
	opts = opts || {};
	server = server || 8080;

	var port = Number(server);
	if (!isNaN(port)) {
		// Create a standard http server
		server = require('http').createServer(lucidtail.client())
			.listen(port);
	}
	// Create and return an emitter
	var aggregator = lucidtail.emitter('socketio', server, opts);

	aggregator.use = function() {
		return aggregator.listen(lucidtail.emitter.apply(null, arguments));
	}

	return aggregator;
}

module.exports = lucidtail;
module.exports.emitter = function (emitter) {
	return module.exports.emitters[emitter].apply(null, Array.prototype.slice.call(arguments, 1));
};
module.exports.client = require('./client');
module.exports.Aggregator = require('./Aggregator');

/**
 * lucidtail library index
 */
module.exports.emitters = {
	udp4: require('./in/udp4')
	, tail: require('./in/tail')
	, test: require('./in/test')
	, socketio: require('./socketio')
	, mongodb: require('./mongodb')
};