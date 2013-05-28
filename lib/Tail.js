var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	spawn = require('child_process').spawn;

module.exports = function (options) {
	EventEmitter.call(this);
	if (typeof options == 'string') {
		options = {file: options};
	} else {
		options = options || {};
	}

	var args = options.args || ['-q', '-n', 0, '-F', options.file];

	var tail = spawn('tail', args)
		.on('error', this.emit.bind(this, 'error'))
		.on('close', console.log.bind(console, 'Child process exited with code:'));
	tail.stderr.on('error', this.emit.bind(this, 'error'));
	tail.stdout.on('data', this.emit.bind(this, 'data'));
}
util.inherits(module.exports, EventEmitter);