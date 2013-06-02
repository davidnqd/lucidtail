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
	, EventEmitter = require("events").EventEmitter;

/**
 * Aggregates `EventEmitter`s
 */
function Aggregator (options) {
	if (!(this instanceof Aggregator)) return new Aggregator(options);
	EventEmitter.call(this);

	options = options || {};

	this.listen = function (emitter) {
		pipe(emitter, this, options.events);
		return this;
	};
	this.pipe = function (emitter) {
		pipe(this, emitter, options.events);
		return this;
	};
};
util.inherits(Aggregator, EventEmitter);

function pipe(source, destination, events) {
	var eventMap = events || ['data', 'error'];
	if (typeof eventMap == 'string')
		eventMap = [eventMap];
	if (eventMap instanceof Array) {
		var map = {};
		for (var i = 0; i < eventMap.length; i++) {
			map[eventMap[i]] = eventMap[i];
		}
		eventMap = map;
	}

	for (var key in eventMap) {
		source.on(key, destination.emit.bind(destination, eventMap[key]));
	}
}

module.exports = Aggregator;