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
var socketio = require('socket.io');

// Used only if not provided by source events
function createSIO (server) {
	var io = socketio.listen(server);
	// Configure socket.io if NODE_ENV=production with author's recommended config
	io.configure('production', function() {
		io.enable('browser client minification');  // send minified client
		io.enable('browser client etag');          // apply etag caching logic based on version number
		io.enable('browser client gzip');          // gzip the file
		io.set('log level', 1);                    // reduce logging
	});

	io.configure('development', function() {
		io.set('log level', 2);
	});
	return io;
}

module.exports = function exports (opts) {
	opts = opts || {};
	return function decorate(emitter, server) {
		// Serve up client-side socket.io resources
		var io = createSIO(server);

		var previous = null;
		var namespace = (opts.of)? io.of(opts.of) : io.sockets;
		namespace.on('connection', function (socket) {
			var listenerCount = emitter.listeners('request').length;
			if (listenerCount > 0) {
				if (listenerCount > 1)
					console.warn('Multiple request handlers are not currently supported.');

				socket.set('previous', previous, socket.emit.bind(socket, 'ready'));
				socket.on('request', function (filter) {
					emitter.emit('request', filter, socket);
				});
			}
		});

		var sequence = 0;
		emitter.on('data', function (event, meta) {
			meta = meta || {};
			previous = meta.id || sequence++;
			namespace.emit('data', event);
		});

		return emitter;
	};
};
