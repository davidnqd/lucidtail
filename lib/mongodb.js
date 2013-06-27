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

var Aggregator = require('./').Aggregator
	, util = require('util')
;

function MongoAggregator (url, options) {
	Aggregator.call(this);

	options = options || {};
	options.size = options.size || 1024;
	options.collectionName = options.collectionName || 'events';
	options.safe = options.safe || false;

	var self = this;

	self.callEmitErrors(Db.connect.bind(Db, url), function (db) {
		self.callEmitErrors(db.collectionNames.bind(db, options.collectionName), function (names) {
			if (names.length == 0 && !options.safe) {
				var collectionOptions = {capped: true, strict: true, size: options.size};
				self.callEmitErrors(db.createCollection.bind(db, options.collectionName, collectionOptions), self.setCollection.bind(self));
			} else {
				self.callEmitErrors(db.collection.bind(db, options.collectionName), self.setCollection.bind(self));
			}
		});
	});
};
util.inherits(MongoAggregator, Aggregator);

MongoAggregator.prototype.collection = null;

MongoAggregator.prototype.setCollection = function (collection) {
	var self = this;
	self.callEmitErrors(collection.options.bind(collection), function (collectionOptions) {
		if (!collectionOptions.capped) {
			self.emit('error', new Error('Collection exists, but is not a capped collection'));
		} else {
			self.collection = collection;
			self.openCursor(collection);
		}
	});
};

MongoAggregator.prototype.openCursor = function (collection) {
	var self = this;
	var latest = collection.find({}).sort({ $natural: -1 }).limit(1);
	self.callEmitErrors(latest.nextObject.bind(latest), function (latest) {
		var query = { _id: { $gt: latest._id }};
		var cursorOptions = { tailable: true, awaitdata: true, numberOfRetries: -1 };
		var cursor = collection.find(query, cursorOptions);
		self.callEmitErrors(cursor.each.bind(cursor), function(item) {
			if (item != null)
				self.emit('data', item);
			if (cursor.isClosed())
				self.emit('error', new Error('Cursor closed'));
		});
	});
}

MongoAggregator.prototype.callEmitErrors = function (callback, success) {
	var self = this;
	return callback(function (err, obj) {
		if (err)
			self.emit('error', err);
		else if (success)
			success(obj);
	});
};

MongoAggregator.prototype.listen = function (source) {
	var self = this;
	source.on('data', function (data) {
		var collection = self.collection;
		if (collection) {
			self.callEmitErrors(collection.insert.bind(collection, data));
		} else {
			console.warn("lucidtail-mongodb: Incoming message discarded. Connection to mongodb not yet established.");
		}
	});
	source.on('error', this.emit.bind(this, 'error'));
	return this;
};

module.exports = function (url, options) {
	if (mongodb == null)
		throw new Exception('Could not load mongodb-native-driver');

	return new MongoAggregator(url, options);
};