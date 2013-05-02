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
exports = module.exports = function (server, options) {
	options = options || {};

	exports.asHTTPHandler(server, options.prefix);
	exports.asEventMultiplexer(server, options.source);
	exports.asEventCache(server, options.maxCacheSize);
	exports.asSocketBroadcaster(server, options.socket_namespace);

	return server;
};
exports.APPLICATION = 'lucidGREP';
exports.PROTOCAL_VERSION = '0.0.1';
exports.DATA_EVENT = 'data';
exports.ERROR_EVENT = 'error';

function eventVarArgs(args, start) {
	if (args[start] instanceof Array) return args[start];
	return (args.length < start)
	   ? [exports.DATA_EVENT, exports.ERROR_EVENT]
	   : Array.prototype.slice.apply(args, start);
}

exports.asEventMultiplexer = function (emitter) {
	emitter.listenTo = function (listened, source) {
		var self = this;
		var events = eventVarArgs(arguments, 3);
		events.forEach(function (event) {
			listened.on(event, function (data) {
				self.emit(event, {source: source, data: data});
			});
		});
	}
	return emitter;
}

exports.asEventCache = function(emitter, maxCacheSize) {
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

exports.asSocketBroadcaster = function (server, socket_namespace) {
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

// TODO: This should be a connect middleware function
exports.asHTTPHandler = function (server, prefix) {
	var express = require('express'), app = express();

	prefix = prefix || '/';

	app.get(prefix + '/version', function(req, res) {
		res.send({name: exports.APPLICATION + ' Protocal', version: exports.PROTOCAL_VERSION});
	});
	app.use(prefix, express.static(__dirname + '/client'));
	server.on('request', app);
	return server;
}
