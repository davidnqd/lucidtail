var spawn = require('child_process').spawn,

function TailModule (options) {
	var self = this;
	self.tailProcess = self.child_process;
	self.emitter = self.child_process.stdout;
	options.initialLines = options.initialLines || 0;

	var args = ["-F", options.file, "n"];
	args.push(options.initialLines || 0);
	self.child_process = spawn("tail", args);
	self.emitter = new CachedEmitter();
}

