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
function Client() {
	this.resultsPane = $();
	this.filterTab = $();
	this.highlightTab = $();
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
		
		self.callbacks.push(function (node) {
			if (pauseTime && new Date(node.data(Client.RECIEVED_KEY)) >= pauseTime)
				node.hide();
		});

		return this;
	},

	asMessageFilter: function (element) {
		this.callbacks.push(function (node) {
			var elementValue = element.val();
			if (elementValue && node.text().toLowerCase().indexOf(elementValue.toLowerCase()) === -1)
				node.hide();
		});

		element.change(this.refresh.bind(this));

		return this;
	},

	asHighlighter: function (element, key) {
		this.callbacks.push(function (node) {
			var elementValue = element.val();
			if (elementValue && node.text().toLowerCase().indexOf(elementValue.toLowerCase()) !== -1)
				node.css('background-color', 'yellow');
		});

		element.change(this.refresh.bind(this));

		return this;
	},

	asResultsPane: function(element) {
		this.resultsPane = $(element);
		return this;
	},

	asHighlightTab: function(element) {
		this.highlightTab = $(element);
		return this;
	},

	asFilterTab: function(element) {
		this.filterTab = $(element);
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
			node.data(Client.RECIEVED_KEY, +new Date);
			if (typeof event[key] == 'string') {
				value = event[key].toLowerCase();
				node.data(key, value);
				if (self.attributesCache[key] === undefined) {
					self.attributesCache[key] = {};

					self.filterTab.append(
						createAutocomplete(self, key, function(node, matches) {
							if (!matches) node.hide();
						})
					);

					self.highlightTab.append(
						createAutocomplete(self, key, function(node, matches) {
							if (matches) node.css('background-color', 'yellow');
						})
					);
				}
				self.attributesCache[key][value] = true;
			}
		}

		node.on('refresh', function () {
			node.removeAttr('style');
			for (var j = 0; j < self.callbacks.length; j++) {
				self.callbacks[j](node);
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

function createAutocomplete (self, key, callback) {
	key = key.toLowerCase();

	var element = $('<input />').uniqueId();

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
			var terms;
			if (element.val()) {
				terms = split(element.val());
				terms.pop();
			} else {
				terms = [];
			}
			terms.push( ui.item.value, '' );
			this.value = terms.join( ', ' );
			element.change();
			return false;
		}
	});

	self.callbacks.push(function (node) {
		var elementValue = element.val();
		var nodeData = node.data(key);
		if (elementValue && nodeData !== null) {
			var values = split( elementValue.toLowerCase() );
			if (values.length > 0)
				callback(node, values.indexOf(nodeData.toLowerCase()) != -1);
		}
	});

	element.change(self.refresh.bind(self));
	return $('<label />', {label: element.attr('id'), text: key}).add(element);
}

function split( val ) {
	return val.replace(/^[\s,]+|[\s,]+$/g, '').split( /\s*,\s*/ );
}