var send = require('send');

exports = module.exports = function(options) {
	return function(req, res, next) {
		send(req, req.url, options)
			.root(__dirname + '/../client')
			.on('error', function (err) {
				res.statusCode = err.status || 500;
				res.end(err.message);
			})
			.pipe(res);
	};
};
