var util = require('util'),
	events = require('events'),
	dgram = require('dgram');

module.exports = function (port) {
	events.EventEmitter.call(this);

	var self = this;

	dgram.createSocket('udp4')
		.on('message', function (msg, rinfo) {
			self.emit('data', {data: String(msg), rinfo: rinfo});
		})
		.on('error', self.emit.bind(self, 'error'))
		.on('listening', console.log.bind(console, 'SyslogUDP: Listening to UDP port', port));

	console.log('SyslogUDP: Binding to UDP port', port);
	server.bind(port);
}
util.inherits(module.exports, events.EventEmitter);
