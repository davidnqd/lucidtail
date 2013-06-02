/**
		webtail
		i.e. webtail file*.log --udp4 514 -p 8080
		Copyright (C) 2013	David Duong

		https://github.com/davidnqd/webtail

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
var util = require("util"),
	EventEmitter = require("events").EventEmitter;

/**
 * Aggregates `EventEmitter`s
 */
function Aggregator (options) {
	if (!(this instanceof Aggregator)) return new Aggregator(options);
	EventEmitter.call(this);

	options = options || {};
	options.events = options.events || ['data', 'error'];
	options.toEvents = options.toEvents || options.events;

	this.listen = function (emitter) {
		if (emitter instanceof EventEmitter) {
			pipe(emitter, this, options.events, options.toEvents);
		} else if (typeof emitter == 'string') {
			emitter = emitter.replace(/\W/g, '');
			var factory = require('./in/' + emitter);
			this.listen(factory.apply(this, Array.prototype.slice.call(arguments, 1)));
		}
		return this;
	};
	this.pipe = function (emitter) {
		pipe(this, emitter, options.events, options.toEvents);
		return this;
	};
};
util.inherits(Aggregator, EventEmitter);

function pipe(source, destination, fromEvents, toEvents) {
	for (var i = 0; i < fromEvents.length; i++) {
		source.on(fromEvents[i], destination.emit.bind(destination, toEvents[i]));
	}
}

module.exports = {
	Aggregator: Aggregator
};