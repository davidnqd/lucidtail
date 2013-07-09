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
}

var q = require('q');

var Aggregator = require('./').Aggregator
	, util = require('util')
;

function MongoAggregator (url, options) {
	Aggregator.call(this);

	this.init(url, options);
}
util.inherits(MongoAggregator, Aggregator);

MongoAggregator.prototype.collection = null;

MongoAggregator.prototype.init = function (url, options) {
	var self = this;

	options = options || {};
	options.size = options.size || 1073741824;
	options.collectionName = options.collectionName || 'events';
	options.safe = options.safe || false;

	var db = null;
	self.call(Db.connect.bind(Db, url))
		.then(function (aDB) {
			db = aDB;
			return self.call(db.collectionNames.bind(db, options.collectionName));
		})
		.then(function (names) {
			if (names.length == 0 && !options.safe) {
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
		.then(function (collection) {
			self.collection = collection;
			return self.call(collection.options.bind(collection));
		})
		.then(function (collectionOptions) {
			if (!collectionOptions.capped) {
				throw new Error('Collection exists, but is not a capped collection');
			}

			var latest = self.collection.find({}).sort({ $natural: -1 }).limit(1);
			return self.call(latest.nextObject.bind(latest));
		})
		.then(function (latest) {
			var query = { };
			if (latest && latest._id) {
				query._id = { $gt: latest._id };
			}
			var cursorOptions = { tailable: true, awaitdata: true, numberOfRetries: -1 };
			var cursor = self.collection.find(query, cursorOptions);
			cursor.each(function (err, item) {
				if (err)
					self.emit('error', err);
				else if (item != null)
					self.emit('data', item, {id: item._id});
				if (cursor.isClosed())
					self.emit('error', new Error('Cursor closed'));
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
		var collection = self.collection;
		if (collection) {
			self.call(collection.insert.bind(collection, data));
		} else {
			console.warn("lucidtail-mongodb: Incoming message discarded. Connection to mongodb not yet established.");
		}
	});
	source.on('error', this.emit.bind(this, 'error'));
	return this;
};

MongoAggregator.prototype.openCursor = function (filter, options, socket) {
	options = options || {};
	var collection = this.collection;
	if (collection) {
		var cursor = collection.find(filter, options);
		var previous_reponse = null;
		cursor.each(function (err, item) {
			if (err) {
				self.emit('error', err);
			} else if (item !== null) {
				socket.emit('data', item, {response: 1});
				previous_reponse = item._id;
			}
			if (cursor.isClosed() && previous_reponse != null)
				socket.set('previous response', previous_reponse, socket.emit.bind(socket, 'ready'));
		});
	} else {
		console.warn("lucidtail-mongodb: Unable to respond to request. Connection to mongodb not yet established.");
	}
}

module.exports = function (url, options) {
	if (mongodb == null)
		throw new Exception('Could not load mongodb-native-driver');

	options = options || {};

	var aggregator = new MongoAggregator(url, options);
	aggregator.on('request', function (filter, socket) {
		var query = {};
		for (var i in filter) {
			if (i == 'data') {
				query.data = { $regex: filter[i], $options: 'i' };
			}
		}

		var cursorOptions = {sort: { $natural: -1 }, limit: options.limit || 50};

		socket.get('previous', function (err, previous) {
			query._id = {$lte: previous};
			socket.get('previous response', function (err2, previous_response) {
				if (previous_response !== null) {
					query._id = {$lte: previous_response};
				}
				aggregator.openCursor(query, cursorOptions, socket);
			});
		});
	});
	return aggregator;
};