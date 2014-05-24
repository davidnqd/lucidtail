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
// TODO: Refactor Client into Services, Controllers and Angular Directivues
'use strict';

angular.module('ltApp', []);

// Legacy code

function Client(resultsPane) {
	this.resultsPane = $(resultsPane);
	this.moreButton = $();
	this.tabs = [];
	this.callbacks = [];
	this.attributesCache = {};
}
Client.RESPONSE_KEY = '_response';
Client.RECIEVED_KEY = '_received';
Client.prototype = {
	addToAutoComplete: function (key, tab) {
		var self = this;

		tab.element.append(self.createAutocomplete(key, tab.callback));
	},

	createDetails: function(event, meta) {
		return $('<details />');
	},

	createSummary: function(event, meta) {
		return $('<summary />', {text: event.data});
	},

	listen: function (emitter) {
		var self = this;

		emitter.on('ready', function () {
			self.moreButton
				.show()
				.one('click', function() {
					self.moreButton.hide();
					emitter.emit('request', {});
				});
		});

		emitter.on('data', function (event, meta) {
			meta = meta || {};
			var definition = $('<dl />');
			var node = self.createDetails(event, meta)
						.append(self.createSummary(event, meta), definition);
			delete event.data;

			node.data(Client.RECIEVED_KEY, +new Date());

			var value;
			for (var key in event) {
				key = key.toLowerCase();
				definition.append( $('<dt />', {text: key}) )
							.append( $('<dd />', {text: JSON.stringify(event[key], undefined, 2) }) );
				if (typeof event[key] == 'string' && key[0] != '_') {
					value = event[key].toLowerCase();
					node.data(key, value);
					if (self.attributesCache[key] === undefined) {
						self.attributesCache[key] = {};

						self.tabs.forEach(self.addToAutoComplete.bind(self, key));
					}
					self.attributesCache[key][value] = true;
				}
			}

			node.on('refresh', node.removeAttr.bind(node, 'style'));
			node.on('refresh', function () {
				for (var j = 0; j < self.callbacks.length; j++) {
					self.callbacks[j](node);
				}
			});

			if (meta.response) {
				node.attr('data-' + Client.RESPONSE_KEY, meta.response);
				self.resultsPane.append(node);
			} else {
				self.resultsPane.prepend(node);
			}
			node.trigger('refresh');
			return node;
		});
		return this;
	},

	asPause: function (element) {
		var self = this;

		var pauseTime;
		element.button().change(function(event) {
			pauseTime = (element.prop('checked'))? new Date(): null;
			self.refresh();
		});

		self.callbacks.push(function (node) {
			if (pauseTime && new Date(node.data(Client.RECIEVED_KEY)) >= pauseTime)
				node.hide();
		});

		return this;
	},

	asTab: function(element, callback) {
		var tab = {element: element, callback: callback};
		this.tabs.push(tab);

		var field = $('<input />', {name: 'data'}).uniqueId();

		this.callbacks.push(function (node) {
			var fieldValue = field.val();
			if (fieldValue)
				callback(node, node.children('summary').text().toLowerCase().indexOf(fieldValue.toLowerCase()) !== -1);
		});

		field.change(this.refresh.bind(this));

		element.append( $('<label />', {label: field.attr('id'), text: 'Message'}).add($('<span/>').append(field)) );

		return this;
	},

	asMore: function (element) {
		this.moreButton = element.button().hide();
		return this;
	},

	refresh: function () {
		this.resultsPane.children().trigger('refresh');
		return this;
	},

	createAutocomplete: function (key, callback) {
		var self = this;
		key = key.toLowerCase();

		var element = $('<input />', {name: key}).uniqueId();

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
				var terms = split(element.val());
				terms.splice(-1, 1, ui.item.value, '');
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
		return $('<label />', {label: element.attr('id'), text: key}).add($('<span/>').append(element));
	}
};

function split( val ) {
	return val.replace(/^[\s,]+|\s+$/g, '').split( /\s*,\s*/ );
}
