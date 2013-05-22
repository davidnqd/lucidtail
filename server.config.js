var LucidGrep = require('./lib'),
	server = new require('http').Server(),
	lucid = new LucidGrep(server);

server.listen(3000);

/*var Tail = require('./lib/Tail');
for (var i = 2; i < process.argv.length; i++) {
	lucid.listen(new Tail(process.argv[i]), process.argv[i]);
}*/

/*var SyslogUDP = require('./lib/SyslogUDP');
lucid.listen(new SyslogUDP(514), "syslog-514");*/

var Test = require('./lib/Test');
lucid.listen(new Test(), "Test 1");
lucid.listen(new Test(), "Test 2");

lucid.on('error', function (err) {
	console.error(err);
});