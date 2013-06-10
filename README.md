lucidTAIL
=========

A real-time zero-configuration web-based tail. It broadcasts events such as
new lines added to any monitored files, new UDP messages, and those emitted by other
[EventEmitters](http://nodejs.org/api/events.html#events_class_events_eventemitter)
to your browser.

Installation
------------

You must already have [nodejs](http://nodejs.org/download/) installed.

### Simple Install

To install lucidTAIL as a global package:

	npm install lucidtail -g

This allows you to  (which also adds the `lucidtail` command to your path)

### Install from Git

Clone the lucidTAIL repo:
	git clone git://github.com/davidnqd/lucidtail.git

You should now be able to use `lucidtail/index.js` or `node lucidtail/index.js`
instead of `lucidtail`.

### Non-global Install

	npm install lucidtail

You can then embed lucidtail ( i.e. `require('lucidtail')` ) in your scripts.

`lucidtail` Command
-------------------

lucidTAIL comes

### --help

	A real-time zero-configuration web-based tail
	Usage: lucidtail [options] [file ...]

	Options:
	  -h, --help, -?   Show this help                                                       [boolean]  [default: false]
	  -p, --http_port  Specify the http port lucidtail services                             [default: 8080]
	  -u, --udp4       Emit incoming UDP messages on the specified port                   
	  -t, --test       Emit a test log message every second with the specified source name
	  -o, --of         Broadcast on a given socket.io namespace.                          

### Examples

`lucidtail` will use it's default http port (8080) when running.

#### Monitor Files

Monitor all files starting with 'file' and ending with '.log'.

	lucidtail file*.log

#### Monitor UDP

Monitor UDP messages on port 514 (syslog). This requires root access on most systems.

	lucidtail -u 514

#### Guess.

	lucidtail file*.log -u 514
