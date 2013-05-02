var util = require('util'),
	events = require('events'),
	spawn = require('child_process').spawn;

module.exports = function (options) {
	events.EventEmitter.call(this);
	if (typeof options == 'string') {
		options = {file: options};
	} else {
		options = options || {};
	}

	var self = this;
	var args = options.args || ['-q', '-n', 0, '-F', options.file];
	var tail = spawn('tail', args);

	tail.on('error', function (e) {
		self.emit('error', e);
	});
	tail.stderr.on('error', function (data) {
		self.emit('error', data);
	});
	tail.stdout.on('data', function (data) {
	console.log(data.toString());
		self.emit('data', data.toString());
	});
	tail.on('close', function (code) {
	  console.log('child process exited with code ' + code);
	});

}
util.inherits(module.exports, events.EventEmitter);