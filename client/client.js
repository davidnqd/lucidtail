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
function Client(input) {
	this.resultsPane = $();
	this.filters = [];
	this.callbacks = [];
	this.attributesCache = {};
}
Client.RECIEVED_KEY = '_received'
Client.prototype = {
	listen: function (emitter) {
		emitter.on('data', this.addEvent.bind(this));
		return this;
	},

	asClear: function (element) {
		element.button().click(this.resultsPane.empty.bind(this.resultsPane));
		return this;
	},

	asPause: function (element) {
		var self = this;

		var pauseTime;
		element.button().change(function(event) {
			pauseTime = (element.prop('checked'))? new Date: null;
			self.refresh();
		});
		
		self.filters.push(function (child) {
			return !pauseTime || new Date(child.data(Client.RECIEVED_KEY)) < pauseTime;
		});

		return this;
	},

	asResultsPane: function (element) {
		this.resultsPane = this.resultsPane.add(element);

		return this;
	},

	asMessageFilter: function (element) {
		this.filters.push(function (child) {
			var elementValue = element.val().toLowerCase();
			return !elementValue || child.text().toLowerCase().indexOf(elementValue) > -1;
		});

		element.change(this.refresh.bind(this));

		return this;
	},

	asHighlighter: function (element, key) {
		this.callbacks.push(function (child) {
			var elementValue = element.val().toLowerCase();
			if (elementValue && child.text().toLowerCase().indexOf(elementValue) > -1) {
				child.css('background-color', 'yellow');
			} else {
				child.css('background-color', '');
			}
		});

		element.change(this.refresh.bind(this));

		return this;
	},

	asFilter: function (element, key) {
		var self = this;
		key = key.toLowerCase();
		element.on( 'keydown', function( event ) {
			if ( event.keyCode === $.ui.keyCode.TAB && $(this).data('ui-autocomplete').menu.active ) {
				event.preventDefault();
			}
		});
		element.autocomplete({
			minLength: 0,
			source: function( request, response ) {
				if (self.attributesCache[key]) {
					var all = Object.keys(self.attributesCache[key]);
					var selected = split( request.term );
					response( all.filter(function (e) { return selected.indexOf(e) < 0; }) );
				}
			},
			focus: function() {
				// prevent value inserted on focus
				return false;
			},
			select: function( event, ui ) {
				var terms = (element.val())? split(element.val()) : [];
				terms.push( ui.item.value, '' );
				element.val(terms.join( ', ' ));
				element.change();
				return false;
			}
		});

		self.filters.push(function (child) {
			var elementValue = element.val().toLowerCase();
			var values = elementValue? split( elementValue ) : [];
			return values.length <= 0 || values.indexOf(child.attr('data-' + key).toLowerCase()) != -1;
		});

		element.change(self.refresh.bind(self));

		return this;
	},

	addEvent: function (event) {
		var self = this;
		var definition = $('<dl />');
		var node = $('<details />')
					.append($('<summary />', {text: event.data}), definition);
		delete event.data;

		var value;
		for (var key in event) {
			key = key.toLowerCase();
			definition.append( $('<dt />', {text: key}) )
						.append( $('<dd />', {text: JSON.stringify(event[key], undefined, 2) }) );
			node.attr('data-' + Client.RECIEVED_KEY, +new Date);
			if (typeof event[key] == 'string') {
				value = event[key].toLowerCase();
				node.attr('data-' + key, value);
				if (self.attributesCache[key] === undefined)
					self.attributesCache[key] = {};
				self.attributesCache[key][value] = true;
			}
		}

		node.on('refresh', function () {
			var visible = true;
			for (var j = 0; visible !== false && j < self.filters.length; j++) {
				visible = self.filters[j](node);
			}
			if (visible) {
				self.callbacks.forEach(function (callback) {
					callback(node);
				});
				node.show();
			} else {
				node.hide();
			}
		});

		self.resultsPane.prepend(node);
		node.trigger('refresh');
		return node;
	},

	refresh: function () {
		this.resultsPane.children().trigger('refresh');

		return this;
	}
};

function split( val ) {
	return val.replace(/^[\s,]+|[\s,]+$/g, '').split( /\s*,\s*/ );
}