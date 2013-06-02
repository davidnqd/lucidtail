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

The `lucidtail` command saves you from having to invoke node.
not required.

	npm install lucidtail

`lucidtail` Command
-------------------

	$ lucidtail -h
	Simple, zero-configuration websocket tail
	Usage: lucidtail [options] [file ...]

	Options:
	  -h, --help       Show this help                                                       [boolean]  [default: false]
	  -p, --http_port  Specify the http port lucidtail services                               [default: 8080]
	  -u, --udp4       Emit incoming UDP messages on the specified port                   
	  -t, --test       Emit a test log message every second with the specified source name