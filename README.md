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
	  -p, --http_port  Specify the http port lucidtail services                             [default: 8080]
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

lucidTAIL Module
----------------

The following assume you have either `npm install lucidtail` or added lucidtail to
your `package.json`.

### Examples
