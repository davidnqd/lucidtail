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
var mongodb = null;

try {
	mongodb = require('mongodb');
	var Db = mongodb.Db;
} catch (err) {
	console.error(err);
}

var Aggregator = require('../').Aggregator
	, util = require('util')
;

module.exports = function (url, opts) {
	opts = opts || {};

	var aggregator = opts.aggregator || new Aggregator();

	// Serve up client-side socket.io resources
	var io = socketio.listen(server);

	aggregator.on('data', function (data) {
	});

	return aggregator;
};