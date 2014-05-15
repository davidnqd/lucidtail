A real-time zero-configuration web-based tail. It broadcasts events such as
new lines added to any monitored files, new UDP messages, and those emitted by other
[EventEmitters](http://nodejs.org/api/events.html#events_class_events_eventemitter)
to your browser.

The lucidtail Command
===================

The `lucidtail` command listens to specified sources and displays them in a pretty little
web application (see [demo](http://lucidtail.herokuapp.com/)).

To quickly be able to view your logs at http://localhost:8080:

	lucidtail *.log

Installation
------------

After having [nodejs](http://nodejs.org/download/) installed:

### Method: Simple

To install lucidtail globally:

	npm install lucidtail -g

This allows you to use the `lucidtail` command. You may need root/Administrator access, if
you don't have it you can alternately get lucidtail from the [git repository](#from-git).

### Method: From GIT

Clone lucidtail:

	git clone git://github.com/davidnqd/lucidtail.git

You should now be able to use `./index.js` or `node index.js` within the cloned directory
instead of `lucidtail`.

### Examples

`lucidtail` will use it's default http port (8080) when running.

For more information: `lucidtail --help`

### Monitor

Monitor all files ending with '.log':

	lucidtail *.log

Monitor UDP messages on syslog port 5144:

	lucidtail -u 5144
	# TIP: If you want to test:
	nc -w0 -u localhost 5144 <<< "<34>1 2003-10-11T22:14:15.003Z mymachine.example.com su - ID47 - BOM'su root' failed for lonvick on /dev/pts/8"

### Publish

On port 8081:

	lucidtail *.log -u 514 -p 8081

lucidtail npm package
=====================

Install lucidtail as a dependency in your [package.json]():

	cd example
	npm init
	npm install lucidtail --save

Monitor a test emitter (which sends a test message every second) and publish events
on the default port (port 8080):

	require('lucidtail')()
		.use('test');

Monitors UDP messages on port 5000:

	require('lucidtail')()
		.use('udp4', 5000);

syslog
------

The following will display inbound syslog messages (UDP port 514) on HTTP port 80:

**Notes**:

 * This example uses [lazy](https://npmjs.org/package/lazy) which is on npm.
 * Port 80 and 514 may require root/Administrator privileges to bind to.

**Example**:

	var lucidtail = require('lucidtail'),
		lazy = require('lazy');

	// Use a simple regex to parse out the values in the message
	// Not even RFC 3164, but this is just an example.
	var regex = /(<\d+>)?(\w{3} +\d+ \d{2}:\d{2}:\d{2})?( \w+)?( \w+\[?\d*\]?)?: (.*)/;
	var syslog = lazy(lucidtail.emitter('udp4', 514))
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
	var emitter = lucidtail(80)
		// Listen to a test emitter
		.listen(syslog);
