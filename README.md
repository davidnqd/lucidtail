lucidTAIL
=========

A real-time zero-configuration web-based tail. It broadcasts events such as
new lines added to any monitored files, new UDP messages, and those emitted by other
[EventEmitters](http://nodejs.org/api/events.html#events_class_events_eventemitter)
to your browser.

Table of Contents
-----------------

1. [`lucidtail` Command](#lucidtail-command)
2. [lucidtail Module](#lucidtail-module)

`lucidtail` Command
-------------------

lucidTAIL comes with a simple command (`lucidtail`) which listens to a number of specified
source and displays them in a pretty little web application.

To quickly be able to view your logs at [http://localhost:8080](http://localhost:8080):

	npm install lucidtail -g # One time global install
	lucidtail *.log

### Installation

You must already have [nodejs](http://nodejs.org/download/) installed.

#### Simple

To install lucidTAIL globally:

	npm install lucidtail -g

This allows you to use the `lucidtail` command. You may need root/Administrator access, if
you don't have it you can alternately get lucidTAIL from the [git repository](#from-git).

#### From GIT

Clone lucidTAIL:

	git clone git://github.com/davidnqd/lucidtail.git

You should now be able to use `lucidtail/index.js` or `node lucidtail/index.js`
instead of `lucidtail`.

### Usage `--help`

	A real-time zero-configuration web-based tail
	Usage: lucidtail [options] [file ...]

	Options:
	  -h, --help, -?   Show this help                                                       [boolean]  [default: false]
	  --http_host      Specify the http host lucidtail services                           
	  -p, --http_port  Specify the http port lucidtail services. (0 = random port)          [default: 8080]
	  -u, --udp4       Emit incoming UDP messages on the specified port                   
	  -t, --test       Emit a test log message every second with the specified source name
	  -o, --of         Broadcast on a given socket.io namespace.                          

### Examples

`lucidtail` will use it's default http port (8080) when running.

#### Monitor Files

Monitor all files ending with '.log'.

	lucidtail *.log

#### Monitor UDP

Monitor UDP messages on port 514 (syslog). This requires root access on most systems.

	lucidtail -u 514

#### Guess.

	lucidtail *.log -u 514

Advanced Setups
---------------

### Examples

The examples assume you have either added lucidtail to your `package.json` or executed:

	npm install lucidtail

#### Simple

	var lucidtail = require('lucidtail');

	// Create an HTTP server which serves the lucidtail client HTML
	var app = require('http').createServer(lucidtail.client())
		.listen(8080);

	// Create aggregate emitter
	var emitter = new lucidtail.Aggregator(app)
		// Send events to socket.io
		.pipe(lucidtail.createEmitter('socketio', app))
		// Listen to a test emitter
		.listen(lucidtail.createEmitter('test'));

#### UDP (using `lucidtail.createEmitter`)

The following will display all incoming traffic on port 514 (the default syslog port).

	var lucidtail = require('lucidtail');

	// Create an HTTP server which serves the lucidtail client HTML
	var app = require('http').createServer(lucidtail.client())
		.listen(8080);

	// Create aggregate emitter
	var emitter = new lucidtail.Aggregator(app)
		// Send events to socket.io
		.pipe(lucidtail.createEmitter('socketio', app))
		// Listen to a test emitter
		.listen(lucidtail.createEmitter('udp4', 514));

#### syslog

The following will display all incoming traffic on port 514 and will try to extract
syslog HEADER data:

**Notes**:

 * This example requires [lazy](https://npmjs.org/package/lazy) which is on npm.
 * Port 514 may require root/Administrator privileges to bind.

**Example**:

	var lucidtail = require('lucidtail'),
		lazy = require('lazy');

	// Create an HTTP server which serves the lucidtail client HTML
	var app = require('http').createServer(lucidtail.client())
		.listen(8080);

	// Use a simple regex to parse out the values in the message
	// Not even RFC 3164, but this is just an example.
	var regex = /(<\d+>)?(\w{3} +\d+ \d{2}:\d{2}:\d{2})?( \w+)?( \w+\[?\d*\]?)?: (.*)/;
	var syslog = lazy(lucidtail.createEmitter('udp4', 514))
		.map(function(data) {
			var matches = data.data.match(regex);
			if (matches) {
				if (matches[1])
					data.pri = matches[1].replace(/[<>]/g, '');
				if (matches[2])
					data.date = matches[2];
				if (matches[3])
					data.host = matches[3].substring(1);
				if (matches[4])
					data.application = matches[4].substring(1);
				if (matches[5])
					data.msg = matches[5];
			}
			return data;
		});

	// Create aggregate emitter
	var emitter = new lucidtail.Aggregator(app)
		// Send events to socket.io
		.pipe(lucidtail.createEmitter('socketio', app))
		// Listen to a test emitter
		.listen(syslog);

API
---

TBC
