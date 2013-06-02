lucidTAIL
=========

A real-time zero-configuration web-based tail. It broadcasts events such as
new lines added to any monitored files, new UDP messages, and those emitted by other
[EventEmitters](http://nodejs.org/api/events.html#events_class_events_eventemitter)
to your browser.


Installation
------------

The following assume you already have npm installed.

h3. lucidTAIL stand-alone

	npm install lucidtail -g

Note: Your permissions may need to

h3. As Library

Either add to your package.json file or:

	npm install lucidtail


Command Line Usage
------------------

	$ lucidtail -h
	Simple, zero-configuration websocket tail
	Usage: lucidtail [options] [file ...]

	Options:
	  -h, --help       Show this help                                                       [boolean]  [default: false]
	  -p, --http_port  Specify the http port lucidtail services                               [default: 8080]
	  -u, --udp4       Emit incoming UDP messages on the specified port                   
	  -t, --test       Emit a test log message every second with the specified source name