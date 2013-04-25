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

function LogRow() {}
LogRow.prototype = {
	setAttribute: function(key, value) {
		this.attr('data-' + key, value);
		LogRow.markAttributeValue(key,value);
	}
}
LogRow.attributesCache = {}
LogRow.markAttributeValue = function(key, value) {
	if (key === undefined)
		return LogRow.attributesCache;
	if (value === undefined)
		return (LogRow.attributesCache[key] === undefined)? {} : LogRow.attributesCache[key];
	if (LogRow.attributesCache[key] === undefined)
		LogRow.attributesCache[key] = {};
	LogRow.attributesCache[key][value] = true;
}

/** Needs to be refactored into a simple callback */
function LogEventHandler (results, config) {
	this.results = results;
	this.handlers = config.handlers || [];
}
LogEventHandler.prototype = {
	attributes: {},
	handlers: [],
	results: null,

	handleEvent: function(event) {
		var node = $('<div class="result"></div>');
		node.extend(LogRow.prototype);

		if (event.attributes) {
			for (var key in event.attributes) {
				node.setAttribute(key, event.attributes[key]);
			}
		}
		node.text(event.text);

		var result;
		for (var i = 0; i < this.eventMappers && node; i++) {
			result = this.eventMappers[i].call(node, event);
			if (result !== undefined) node = result;
		}

		if (node) node.prependTo(this.results);
	}
}

function split( val ) {
	return val.split( /,\s*/ );
}

function asMultipleSelect(widget, options) {
	widget.bind( "keydown", function( event ) {
		if ( event.keyCode === $.ui.keyCode.TAB && $(this).data("ui-autocomplete").menu.active ) {
			event.preventDefault();
		}
	});
	widget.autocomplete({
		minLength: 0,
		source: function( request, response ) {
			var list = LogRow.markAttributeValue("source");
			if (list) {
				response( $.ui.autocomplete.filter( Object.keys(list), split( request.term ).pop() ) );
			}
		},
		focus: function() {
			// prevent value inserted on focus
			return false;
		},
		select: function( event, ui ) {
			var terms = split( this.value );
			// remove the current input
			terms.pop();
			// add the selected item
			terms.push( ui.item.value );
			// add placeholder to get the comma-and-space at the end
			terms.push( "" );
			this.value = terms.join( ", " );
			return false;
		}
	});
}