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

function LucidGREP(resultsPane) {
	this.resultsPane = resultsPane;
}
LucidGREP.prototype = {
	resultsPane: null,
	callbacks: [],
	attributesCache: {},
	asMessageFilter: function (element) {
		var self = this;
		self.callbacks.push(function (child) {
			var elementValue = element.val();
			if ( elementValue && child.text().indexOf(elementValue) == -1 ) child.hide();
			else child.show();
		});

		element.keypress(function () {
			self.resultsPane.children().trigger('refresh');
		});
	},
	asFilter: function (element, key) {
		var self = this;
		element.bind( 'keydown', function( event ) {
			if ( event.keyCode === $.ui.keyCode.TAB && $(this).data('ui-autocomplete').menu.active ) {
				event.preventDefault();
			}
		});
		element.autocomplete({
			minLength: 0,
			source: function( request, response ) {
				var list = self.attributesCache[key];
				if (list) {
					response( $.ui.autocomplete.filter( Object.keys(list), split( request.term ).pop() ) );
				}
			},
			focus: function() {
				// prevent value inserted on focus
				return false;
			},
			select: function( event, ui ) {
				var terms = split ( this.value );
				// remove the current input
				terms.pop();
				// add the selected item
				terms.push( ui.item.value );
				// add placeholder to get the comma-and-space at the end
				terms.push( '' );
				this.value = terms.join( ', ' );
				return false;
			}
		});

		self.callbacks.push(function (child) {
			var elementValue = element.val();
			var values = elementValue? elementValue.split(/,\s*/) : [];
			values.filter(function(element) {
				return element;
			});
			if ( values.length > 0 && values.indexOf(child.attr('data-' + key)) == -1 ) child.hide();
			else child.show();
		});

		element.change(function () {
			self.resultsPane.children().trigger('refresh');
		});
	},

	addEvent: function (event) {
		var self = this;
		var node = $('<div class="result"></div>');
		node.text(event.data);
		delete event.data;

		for (var key in event) {
			node.attr('data-' + key, event[key]);

			if (self.attributesCache[key] === undefined)
				self.attributesCache[key] = {};
			self.attributesCache[key][event[key]] = true;
		}

		node.bind('refresh', function () {
			node.show();

			for (var j = 0; j < self.callbacks.length; j++) {
				self.callbacks[j](node);
			}
		});

		self.resultsPane.prepend(node);
		node.trigger('refresh');
		return node;
	}
}

function split( val ) {
	return val.split( /,\s*/ );
}