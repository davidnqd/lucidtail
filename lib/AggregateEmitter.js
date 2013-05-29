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
var util = require("util"),
	EventEmitter = require("events").EventEmitter;

function AggregateEmitter (options) {
	if (!(this instanceof AggregateEmitter)) return new AggregateEmitter(options);
	EventEmitter.call(this);

	options = options || {};
	options.events = options.events || ['data', 'error'];

	this.listen = function (emitter) {
		pipe(emitter, this, options.events);
		return this;
	};
	this.pipe = function (emitter) {
		pipe(this, emitter, options.events);
		return this;
	};
};
util.inherits(AggregateEmitter, EventEmitter);

function pipe(source, destination, fromEvents, toEvents) {
	toEvents = toEvents || fromEvents;
	for (var i = 0; i < fromEvents.length; i++) {
		source.on(fromEvents[i], destination.emit.bind(destination, toEvents[i]));
	}
}

module.exports = AggregateEmitter;