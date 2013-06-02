lucidTAIL
=========

A real-time zero-configuration web-based tail. It broadcasts events such as
new lines added to any monitored files, new UDP messages, and those emitted by other
[EventEmitters](http://nodejs.org/api/events.html#events_class_events_eventemitter)
to your browser.

Installation
------------

You must already have npm installed.

### Simple Install

To use the `lucidtail` command:

	npm install lucidtail -g

### Without the `lucidtail` command

The `lucidtail` command saves you from having to invoke node, but it is not required.

	npm install lucidtail

`lucidtail` --help
-------------------

	Simple, zero-configuration websocket tail
	Usage: lucidtail [options] [file ...]

	Options:
	  -h, --help       Show this help                                                       [boolean]  [default: false]
	  -p, --http_port  Specify the http port lucidtail services                               [default: 8080]
	  -u, --udp4       Emit incoming UDP messages on the specified port                   
	  -t, --test       Emit a test log message every second with the specified source name

### Example

`lucidtail` will use it's default http port (8080) when running.

#### Monitor Files

Monitor all files starting with 'file' and ending with '.log'.

	lucidtail file*.log

#### Monitor UDP

Monitor UDP messages on port 514 (syslog). This requires root access on most systems.

	lucidtail -u 514

#### Guess.

	lucidtail file*.log -u 514
