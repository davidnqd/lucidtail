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
var util = require("util")
	, Aggregator = require("./Aggregator");

var factories = {
	udp4: require("./in/udp4")
	, tail: require("./in/tail")
	, test: require("./in/test")
};

/**
 * Broadcast an `events.EventEmitter` to a browser through socket.io
 */
function Server (server, options) {
	if (!(this instanceof Server)) return new Server(server, options);
	Aggregator.call(this);

	options = options || {};
	options.path = options.path || '/';
	// Serve up the client-side resources
	var connect = require('connect');
	var app = connect()
		.use(options.path, connect.static(__dirname + '/../client'));
	
	server = app.listen(server);

	// Serve up client-side socket.io resources
	var io = require('socket.io')
		.listen(server)
		.on('connection', this.pipe.bind(this));

	// Configure socket.io if NODE_ENV=production with author's recommended config
	io.configure('production', function() {
		io.enable('browser client minification');  // send minified client
		io.enable('browser client etag');          // apply etag caching logic based on version number
		io.enable('browser client gzip');          // gzip the file
		io.set('log level', 1);                    // reduce logging
	});
}
util.inherits(Server, Aggregator);

Server.prototype.use = function (emitter) {
	this.listen(Server.createEmitter.apply(this, arguments));
	return this;
}

Server.createEmitter = function (emitter) {
	return factories[emitter].apply(null, Array.prototype.slice.call(arguments, 1));
};

module.exports = Server;