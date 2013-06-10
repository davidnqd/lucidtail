var send = require('send'),
	url = require('url');

exports = module.exports = function(options) {
	return function(req, res, next) {
		var urlObj = url.parse(req.url);
		send(req, urlObj.pathname, options)
			.root(__dirname + '/../client')
			.on('error', function (err) {
				res.statusCode = err.status || 500;
				res.end(err.message);
			})
			.pipe(res);
	};
};
