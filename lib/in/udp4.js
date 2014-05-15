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
var EventEmitter = require('events').EventEmitter,
	dgram = require('dgram');

/**
 * Example demonstrating creating an emitter which listens to a UDP4 port
 */
module.exports = function (port) {
	var result = new EventEmitter();

	if (isNaN(port)) {
		throw new Error("Invalid port number");
	} else {
		dgram.createSocket('udp4')
			.on('message', function (msg, rinfo) {
				var address = this.address();
				result.emit('data', {
					data: String(msg),
					remote: rinfo,
					local: address,
					source: "udp4://" + address.address + ":" + address.port
				});
			})
			.on('error', result.emit.bind(result, 'error'))
			.bind(port);
	}

	return result;
};
