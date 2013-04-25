var util = require('util'),
	events = require('events'),
	dgram = require('dgram');

function SyslogUDP (port) {
	var self = this;

	var server = dgram.createSocket("udp4");
	server.on("error", function (e) {
		console.error("Error", e);
	});
	server.on("message", function (msg, rinfo) {
		self.emit('data', [{attributes: {source: "SyslogUDP-" + port}, text: msg.toString()}]);
	});
	server.on("listening", function () {
		console.log("SyslogUDP: Listening to port", port);
		var address = server.address();
	});
	console.log("SyslogUDP: binding to port", port);
	server.bind(port);
}
util.inherits(SyslogUDP, events.EventEmitter);

module.exports = SyslogUDP;