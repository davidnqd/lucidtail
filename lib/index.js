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
var lucidLOG = module.exports = function (server, options) {
	options = options || {};

	lucidLOG.asHTTPHandler(server, options.prefix);
	lucidLOG.asEventMultiplexer(server);
	lucidLOG.asEventCache(server, options.maxCacheSize);
	lucidLOG.asSocketBroadcaster(server, options.socket_namespace);

	return server;
};
lucidLOG.APPLICATION = 'lucidGREP';
lucidLOG.PROTOCAL_VERSION = '0.0.1';
lucidLOG.DATA_EVENT = "data";

function eventVarArgs(args, start) {
	if (args[start] instanceof Array) return args[start];
	return (args.length < start)
	   ? [lucidLOG.DATA_EVENT]
	   : Array.prototype.slice.apply(args, start);
}

lucidLOG.asEventMultiplexer = function (emitter) {
	emitter.listenTo = function (listened) {
		var self = this;
		var events = eventVarArgs(arguments, 2);
		events.forEach(function (event) {
			listened.on(event, function (data) {
				self.emit(event, data);
			});
		});
	}
	return emitter;
}

lucidLOG.asEventCache = function(emitter, maxCacheSize) {
	var self = this;

	emitter.eventCache = [];

	var events = eventVarArgs(arguments, 3);
	for (var i = 0; i < events.length; i++) {
		emitter.on(events[i], function (data) {
			emitter.eventCache.push(data);
			if (emitter.eventCache.length > maxCacheSize)
				emitter.eventCache.splice(0, emitter.eventCache.length - maxCacheSize);
		});
	}
	return emitter;
}

lucidLOG.asSocketBroadcaster = function (server, socket_namespace) {
	var io = require('socket.io').listen(server);

	var events = eventVarArgs(arguments, 3);
	var socketServer = (socket_namespace)? io.of(socket_namespace) : io;
	socketServer.on('connection', function (socket) {
		events.forEach(function (event) {
			server.on(event, function (data) {
				socket.emit(event, data);
			});
		});
		return server;
	});
}

lucidLOG.asHTTPHandler = function (server, prefix) {
	var express = require('express'), app = express();

	prefix = prefix || '/';

	app.get(prefix + '/version', function(req, res) {
		res.send({name: lucidLOG.APPLICATION + " Protocal", version: lucidLOG.PROTOCAL_VERSION});
	});
	app.use(prefix, express.static(__dirname + '/../client'));
	server.on('request', app);
	return server;
}
