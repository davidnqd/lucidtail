lucidTAIL
=========

A real-time zero-configuration web-based tail. It broadcasts events such as
new lines added to any monitored files, new UDP messages, and those emitted by other
[EventEmitters](http://nodejs.org/api/events.html#events_class_events_eventemitter)
to your browser.

`lucidtail` Command
-------------------

The `lucidtail` command listens to specified sources and displays them in a pretty little
web application.

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

### Usage

Please see `lucidtail --help`

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

#### Test

Create an instance of lucidTAIL which services the default port (port 8080):

	require('lucidtail')()
		.use('test');

#### UDP

The following will display all inbound UDP packets on port 1337:

	require('lucidtail')()
		.use('udp4', 1337);

**Note**: Port 80 and 514 are usually restricted ports and may require root/Administrator
privileges.

#### syslog

The following will display inbound syslog messages (port 514) on HTTP port 80:

**Notes**:

 * This example requires [lazy](https://npmjs.org/package/lazy) which is on npm.
 * Port 80 and 514 may require root/Administrator privileges to bind.

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

API
---

The API is exposed by `require('lucidtail')` and is still rapidly evolving, but the gist
of it is:

### `lucidtail([server|port=8080][, options])`

A convenience method which returns an instance of `lucidtail.Aggregator`. All events
emitted by the returned `lucidtail.Aggregator` will be sent through a socket.io socket to 
users.

 * 'server|port': either a `http.Server` or a port (default = 8080)
 * 'options': the options object
	* 'host': http host to listen to (default = `INADDR_ANY`)
	* 'of': socket.io namespace to use

### `lucidtail.Aggregator`

A sub class of [`events.EventEmitter`](http://nodejs.org/api/events.html#events_class_events_eventemitter).

#### `lucidtail.Aggregator.pipe(destination[, events])`

Forward events to a destination `events.EventEmitter`.

 * `destination`: Destination `events.EventEmitter`
 * `events`: An array of events to forward (default: ['data', 'error']) or an object whose
 key/value pairs are used to map source events (keys) to destination events (value).

#### `lucidtail.Aggregator.listen(source[, events])`

The opposite of `lucidtail.Aggregator.pipe(destination[, events])`.

### `lucidtail.emitter(name[, arg1, arg2])`

A connivence method which creates `events.EventEmitter`s which emit.

 * `name` object
	* `tail': `tail` a file specified by arg1 (default: 'test')
	* `test`: Emit a test message every second
	* `udp`: Emit inbound UDP messages on a port specified by arg1
	* `socketio`: Pipes emitted events to a socket.io socket servicing `http.Server` arg1.

### `lucidtail.client()`

Creates a `http.Server` request handler which serves client-side resources.
