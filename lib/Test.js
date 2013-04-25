function Test (cb, options) {
	var self = this;
	var i = 0;

	setInterval(function () {
		cb({data: "test " + ++i});
		console.log("emitting: test" + i);
	}, 1000);
}

module.exports = Test;