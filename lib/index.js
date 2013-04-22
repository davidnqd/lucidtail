/**
		lucidGREP - Simple web.ui for text files
		Copyright (C) 2013	David Duong

		https://github.com/davidnqd/lucidGREP

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
function Server (server, options) {
	if (!(this instanceof Server)) return new Server(server, options);

	if ('object' == typeof server && !server.listen) {
		options = server;
		server = options.server || null;
	}
	options = options || {};
	if (server) this.listen(server, options);
};
Server.APPLICATION = 'lucidGREP';
Server.PROTOCAL_VERSION = '0.0.1';
Server.prototype.listen = function (server, options) {
	var express = require('express'),
		app = express();

	var prefix = options.prefix || '/' + Server.APPLICATION;
	app.get(prefix + '/version', function(req, res) {
		res.send({name: Server.APPLICATION + " Protocal", version: Server.PROTOCAL_VERSION});
	});

	app.use(prefix, express.static(__dirname + '/../client'));
	server.on('request', app);

	var io = options.io || require('socket.io').listen(server);
	io.on('connection', function(socket) {
		socket.on('meta', function (name, fn) {
			socket.emit('meta', { version: '1.0' });
		});
		socket.emit('tail', [{source: "test", text: "Jan 26 20:53:31 server\tINFO\tapplication\tSystem rebooted for hard disk upgrade"},
							 {source: "test", text: "Jan 26 20:53:31 server\tERROR\tapplication\tSystem rebooted for hard disk upgrade!"}]);
	});
}

module.exports = Server;