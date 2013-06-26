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

var EventEmitter = require('events').EventEmitter
	, util = require('util')
;

module.exports = function (url, options) {
	if (mongodb == null)
		throw new Exception('Could not load mongodb-native-driver');

	options = options || {};
	options.size = options.size || 1024;
	options.collectionName = options.collectionName || 'events';
	options.safe = options.safe || false;

	var emitter = options.emitter || new EventEmitter();

	function chainCall (callback, success) {
		return callback(function (err, obj) {
			if (err)
				emitter.emit('error', err);
			else
				success(obj);
		});
	}

	var successCollectionCallback = function (collection) {
		chainCall(collection.options.bind(collection), function (collectionOptions) {
			if (!collectionOptions.capped) {
				emitter.emit('error', new Error('Collection exists, but is not a capped collection'));
			} else {
				var latest = collection.find({}).sort({ $natural: -1 }).limit(1);
				chainCall(latest.nextObject.bind(latest), function (latest) {
					var query = { _id: { $gt: latest._id }};
					var cursorOptions = { tailable: true, awaitdata: true, numberOfRetries: -1};
					var cursor = collection.find(query, cursorOptions);
					chainCall(cursor.each.bind(cursor), function(item) {
						if (item != null)
							emitter.emit('data', item);
						if (cursor.isClosed())
							emitter.emit('error', new Error('Cursor closed'));
					});
				});
			}
		});
	};

	chainCall(Db.connect.bind(Db, url), function (db) {
		chainCall(db.collectionNames.bind(db, options.collectionName), function (names) {
			if (names.length == 0 && !options.safe) {
				var collectionOptions = {capped: true, strict: true, size: options.size};
				chainCall(db.createCollection.bind(db, options.collectionName, collectionOptions), successCollectionCallback);
			} else {
				chainCall(db.collection.bind(db, options.collectionName), successCollectionCallback);
			}
		});
	});

	return emitter;
};