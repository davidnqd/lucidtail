var httpServer = require('http').Server();

var lucidGREP = require('./lib')({
	server: httpServer,
	prefix: '/'
});

var files = process.argv.slice(2);
console.log(files);


httpServer.listen(3000);
