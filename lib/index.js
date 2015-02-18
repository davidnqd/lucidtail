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
var http = require('http');
var serveStatic = require('serve-static');
var finalhandler = require('finalhandler');
var socketio = require('socket.io');
var Aggregator = require('./Aggregator');

exports = module.exports = function (server, opts) {
	opts = opts || {};

	var socket = createSocket(prepareServer(server), opts.of);
	var aggregator = new Aggregator();

	var previous = null;
	var sequence = 0;

	socket.on('connection', function (socket) {
		var listenerCount = aggregator.listeners('request').length;
		if (listenerCount > 0) {
			socket.set('previous', previous, socket.emit.bind(socket, 'ready'));
			socket.on('request', function (filter) {
				aggregator.emit('request', filter, socket);
			});
		}
	});

	return aggregator.on('data', function (event, meta) {
		meta = meta || {};
		previous = meta.id || sequence++;
		socket.emit('data', event);
	});
};

/**
 * Create a socket
 */
function createSocket(server, of) {
	var io = socketio(server);
	return (of)? io.of(of) : io.sockets;
}

/**
 * Ensure we have an instance of http.Server listening to requests
 */
function prepareServer(server) {
	server = server || 8080;

	// Create a standard http server if one was not specified
	if (!isNaN(server)) {
		server = http.createServer().listen(Number(server));
	}

	server.on('request', function httpRequestHandler (req, res) {
		var serve = serveStatic(__dirname + '/../app');
		serve(req, res, finalhandler(req, res));
	});

	return server;
}
