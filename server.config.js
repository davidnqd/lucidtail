var lucidLOG = require('./lib'),
	SyslogUDP = require('./lib/SyslogUDP');

var server = lucidLOG(new require('http').Server());

var syslogListener = new SyslogUDP(514);
server.listenTo(syslogListener);

setInterval(function(){
	server.emit('data', [{attributes: {source: "Test"}, text: "Test"}]);
}, 1000);


server.listen(3000);
