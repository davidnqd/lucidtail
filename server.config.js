var asLucidGREP = require('./lib'),
	server = asLucidGREP(new require('http').Server());
server.listen(3000);

var Tail = require('./lib/Tail');
for (var i = 2; i < process.argv.length; i++) {
	server.listenTo(new Tail(process.argv[i]), process.argv[i]);
}

var SyslogUDP = require('./lib/SyslogUDP');
server.listenTo(new SyslogUDP(5140), "syslog-5140");

var Test = require('./lib/Test');
server.listenTo(new Test(), "Test 1");
server.listenTo(new Test(), "Test 2");