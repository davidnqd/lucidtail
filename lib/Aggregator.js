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
var util = require('util'),
	EventEmitter = require('events').EventEmitter;

/**
 * Aggregates `EventEmitter`s
 */
function Aggregator (decorated) {
	if (typeof decorated === 'undefined') {
		EventEmitter.call(this);
		decorated = this;
	} else {
		decorated.pipe = Aggregator.prototype.pipe;
		decorated.listen = Aggregator.prototype.listen;
	}
	decorated._emitterCount = 0;
}

util.inherits(Aggregator, EventEmitter);

Aggregator.prototype.pipe = function (destination) {
	Aggregator.prototype.listen.call(destination, this);
	return this;
};

Aggregator.prototype.listen = function (source) {
	source.on('data', this.emit.bind(this, 'data'));
	source.on('error', this.emit.bind(this, 'error'));
	this._emitterCount++;
	return this;
};

Aggregator.prototype.emitterCount = function () {
	return this._emitterCount;
};

Aggregator.prototype.listenerCount = function () {
	return EventEmitter.listenerCount(this, 'data');
};

module.exports = Aggregator;
