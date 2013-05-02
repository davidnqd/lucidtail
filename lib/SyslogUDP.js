var util = require('util'),
	events = require('events'),
	dgram = require('dgram');

module.exports = function (port) {
	events.EventEmitter.call(this);

	var self = this;

	var server = dgram.createSocket('udp4');
	server.on('error', function (e) {
		self.emit('error', e);
	});
	server.on('message', function (msg, rinfo) {
		self.emit('data', msg.toString());
	});
	server.on('listening', function () {
		console.log('SyslogUDP: Listening to UDP port', port);
		var address = server.address();
	});
	console.log('SyslogUDP: Binding to UDP port', port);
	server.bind(port);
}
util.inherits(module.exports, events.EventEmitter);
