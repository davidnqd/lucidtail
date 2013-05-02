var util = require('util'),
	events = require('events');

module.exports = function () {
	events.EventEmitter.call(this);

	var self = this;
	var i = 0;
	setInterval(function() {
		self.emit('data', 'Test ' + i++);
	}, 1000);
}
util.inherits(module.exports, events.EventEmitter);