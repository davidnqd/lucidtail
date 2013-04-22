/**
		lucidGREP - Simple web.ui for text files
		Copyright (C) 2013	David Duong

		https://github.com/davidnqd/lucidGREP

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

function LogEventHandler (results, config) {
	this.results = results;
	this.handlers = config.handlers || [];
}
LogEventHandler.prototype = {
	attributes: {},
	handlers: {},
	results: null,

	handleEvent: function(event) {
		var node = $('<div class="result"></div>');
		if (event.data) {
			for (var key in event.data) {
				setAttribute(node, key, event.data[key]);
			}
		}
		node.text(event.text);

		var result;
		for (var i = 0; i < this.eventMappers && node; i++) {
			result = this.eventMappers[i].call(node, event);
			if (result !== undefined) node = result;
		}

		if (node) node.prependTo(this.results);
	},

	setAttribute: function(node, key, value) {
		node.attr('data-' + key, value);
		if (!attributesValues[key])
			attributesValues[key] = {};
		attributesValues[key][value] = true;
	}
}