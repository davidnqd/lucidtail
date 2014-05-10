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
var send = require('send'),
	url = require('url'),
	Aggregator = require('./Aggregator'),
	sioEmitter = require('./socketio');

function requestListener (req, res, next) {
	var urlObj = url.parse(req.url);
	send(req, urlObj.pathname)
		.root(__dirname + '/../client')
		.on('error', function (err) {
			res.statusCode = err.status || 500;
			res.end(err.message);
		})
		.pipe(res);
}

exports = module.exports = function createApplication(server, opts) {
	opts = opts || {};
	server = server || 8080;

	// Create a standard http server if one was not specified
	if (!isNaN(server))
		server = require('http').createServer(requestListener).listen(Number(server));

	// Create and return an emitter
	return sioEmitter(opts)(server);
};
exports.Aggregator = Aggregator;
exports.version = '1.0';