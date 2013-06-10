/**
		lucidtail
		ie. lucidtail *.log -p 8080
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
function Aggregator () {
	if (!(this instanceof Aggregator)) return new Aggregator(options);
	EventEmitter.call(this);
};
util.inherits(Aggregator, EventEmitter);

Aggregator.prototype.pipe = function (destination, events) {
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
		this.on(key, destination.emit.bind(destination, eventMap[key]));
	}
	return this;
};

Aggregator.prototype.listen = function (source, events) {
	this.pipe.apply(source, [this, events]);
	return this;
};

module.exports = Aggregator;