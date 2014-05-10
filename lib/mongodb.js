/**
		lucidtail
		ie. lucidtail *.log
		Copyright (C) 2013	David Duong

		https://github.com/davidnqd/lucidtail

		This program is free software: you can redistribute it and/or modify
		it under the terms of the GNU Affero General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version.

		This program is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
		GNU Affero General Public License for more details.

		You should have received a copy of the GNU Affero General Public License
		along with this program.	If not, see <http://www.gnu.org/licenses/>.
*/
var mongodb = null;

try {
	mongodb = require('mongodb');
	var Db = mongodb.Db;
} catch (err) {
	console.error(err);
	return;
}

var Aggregator = require('./').Aggregator,
	util = require('util'),
	q = require('q');

function MongoAggregator (url, options) {
	Aggregator.call(this);

	this.collection = null;

	this.init(url, options);
}
util.inherits(MongoAggregator, Aggregator);

MongoAggregator.prototype.init = function (url, options) {
	var self = this;

	options = options || {};
	options.size = options.size || 1073741824;
	options.collectionName = options.collectionName || 'events';
	options.safe = options.safe || false;

	var db = null;
	self.call(Db.connect.bind(Db, url))
		// Connect to the database
		.then(function (aDB) {
			db = aDB;
			return self.call(db.collectionNames.bind(db, options.collectionName));
		})
		// Find the collection or create if it does not exist
		.then(function (names) {
			if (names.length === 0 && !options.safe) {
				console.log('Collection not found, attempting to create');
				var collectionOptions = {
					capped: true,
					strict: true,
					size: options.size
				};
				return self.call(db.createCollection.bind(db, options.collectionName, collectionOptions));
			}
			return self.call(db.collection.bind(db, options.collectionName));
		})
		// Get collection stats
		.then(function (collection) {
			self.collection = collection;
			return self.call(self.collection.stats.bind(self.collection));
		})
		// Make sure that the collection is capped and primed
		.then(function (stats) {
			if (!stats.capped)
				throw new Error('Collection exists, but is not a capped collection');

			if (stats.count === 0) {
				console.log('Empty capped collection found, priming collection with an empty document');
				return self.call(self.collection.insert.bind(self.collection, {}, {safe: true}));
			}
		})
		// Get the latest document
		.then(function () {
			var latest = self.collection.find({})
				.sort({ $natural: -1 })
				.limit(1);
			return self.call(latest.nextObject.bind(latest));
		})
		// Open a tailable cursor
		.then(function (latest) {
			var query = { };
			if (latest && latest._id) {
				query._id = { $gt: latest._id };
			}
			var cursorOptions = { tailable: true, awaitdata: true, numberOfRetries: -1 };
			self.collection.find(query, cursorOptions)
				.each(function (err, item) {
					if (err)
						self.emit('error', err);
					else if (item === null)
						self.emit('error', 'Cursor closed');
					else
						self.emit('data', item, {id: item._id});
				});
		});
};

MongoAggregator.prototype.call = function (callback) {
	var self = this;
	return q.nfcall(callback)
		.fail(function(err) {
			self.emit('error', err);
		});
};

MongoAggregator.prototype.listen = function (source) {
	var self = this;
	source.on('data', function (data) {
		if (self.collection) {
			self.call(self.collection.insert.bind(self.collection, data));
		} else {
			console.warn("lucidtail-mongodb: Incoming message discarded. Connection to mongodb not yet established.");
		}
	});
	source.on('error', this.emit.bind(this, 'error'));
	return this;
};

MongoAggregator.prototype.openCursor = function (filterIsEmpty, query, options, socket) {
	options = options || {};
	var self = this;
	if (self.collection) {
		var previous_reponse = null;
		self.collection.find(query, options)
			.each(function (err, item) {
				if (err) {
					self.emit('error', err);
				} else if (item !== null) {
					socket.emit('data', item, {response: !filterIsEmpty});
					previous_reponse = item._id;
				} else if (previous_reponse !== null) {
					var key = (filterIsEmpty)? 'previous' : 'previous response';
					socket.set(key, previous_reponse, socket.emit.bind(socket, 'ready'));
				}
			});
	} else {
		console.warn("lucidtail-mongodb: Unable to respond to request. Connection to mongodb not yet established.");
	}
};

module.exports = function (url, options) {
	if (mongodb === null)
		throw new Exception('Could not load mongodb-native-driver');

	options = options || {};

	return new MongoAggregator(url, options)
		.on('request', function (filter, socket) {
			var self = this;
			var query = {};
			for (var i in filter) {
				if (i == 'data') {
					query.data = { $regex: filter[i], $options: 'i' };
				}
			}

			var cursorOptions = {sort: { $natural: -1 }, limit: options.limit || 50};
			var qPrevious = self.call(socket.get.bind(socket, 'previous'));
			var qPreviousResponse = self.call(socket.get.bind(socket, 'previous response'));
			q.all([qPrevious, qPreviousResponse])
				.then(function (results) {
					query._id = (results.length > 1 && results[1] !== null)? {$lt: results[1]} : {$lte: results[0]};
					self.openCursor(Object.keys(filter).length === 0, query, cursorOptions, socket);
				});
		});
};