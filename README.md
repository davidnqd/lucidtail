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

To install lucidTAIL as a global package (which also adds the `lucidtail` command to your path):

	npm install lucidtail -g

### Install from Git

	git clone git://github.com/davidnqd/lucidtail.git

You should now have a copy of lucidtail in ./lucidtail and you can execute
`lucidtail/index.js` instead of `lucidtail`

### Install locally

	npm install lucidtail

You can then use lucidTAIL as a library in your scripts.

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
