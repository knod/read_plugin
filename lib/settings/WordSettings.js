/* WordSettings.js
* 
* UI elements for setting various word features, like
* max number of displayed characters.
*/

(function (root, wordSetsFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( ['jquery', '@knod/nouislider'], function ( jquery, nouislider ) {
        	return ( root.WordSettings = wordSetsFactory( jquery ) );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = wordSetsFactory( require('jquery'), require('@knod/nouislider') );
    } else {
        // Browser globals
        root.WordSettings = wordSetsFactory( root.jQuery, root.noUiSlider );  // not sure noUi is here
    }
}(this, function ( $, noUiSlider ) {

	"use strict";

	var WordSettings = function ( settings, coreSettings ) {

		var wSets = {};

		wSets.node 	  = null;
		wSets.tabText = 'Words';

		wSets._nodes  = {};
		var nodes 	  = wSets._nodes;

		nodes.maxCharsInput 	= null;
		nodes.maxCharsSlider 	= null;


		wSets._oneSlider = function ( data ) {
		/* ( {} ) -> ?
		* 
		* Turn the given data into one noUiSlider slider
		*/
			// To keep handles within the bar
			$(data.sliderNode).addClass('noUi-extended');

			var slider = noUiSlider.create( data.sliderNode, {
				range: { min: data.range.min, max: data.range.max },
				start: data.startVal,
				step: data.step,
				connect: 'lower',
				handles: 1,
				behaviour: 'extend-tap',
				serialization: {
					to: [data.inputNode],
					resolution: data.resolution
				}
			});

			data.sliderNode.noUiSlider.on('update', function( values, handle ) {
				data.inputNode.value = values[handle];
				settings.set( data.operation, values[handle] );
			});

			data.inputNode.addEventListener('change', function(){
				data.sliderNode.noUiSlider.set(this.value);
				settings.set( data.operation, this.value );
			});

			return data.sliderNode;
		};  // End wSets._oneSlider()


		wSets._makeSliders = function () {

			var slider 	= wSets._oneSlider,
				nodes 	= wSets._nodes,
				setts 	= settings._settings;

			slider({
				sliderNode: nodes.maxCharsSlider,
				range: 		{ min: 1, max: 25 },
				startVal: 	setts.maxNumCharacters,
				step: 		1,
				inputNode: 	nodes.maxCharsInput,
				resolution: 1,
				operation: 	'maxNumCharacters'
			});

			return wSets;
		};  // End wSets._makeSliders()


		wSets._assignSettingItems = function () {

			var nodes = wSets._nodes,
				$menu = $(nodes.menu);

			nodes.maxCharsInput 	= $menu.find('#__rdly_maxchars_input')[0];
			nodes.maxCharsSlider 	= $menu.find('#__rdly_maxchars_slider')[0];

			return wSets;
		};  // End wSets._assignSettingItems()

		wSets._oneSetting = function ( idName, label ) {
			// Should the very specific classes be ids?
			return $('<div id="__rdly_' + idName + '_setting" class="__rdly-setting">\
						<label class="__rdly-slider-label">' + label + '</label>\
						<div class="__rdly-slider-controls">\
							<input id="__rdly_' + idName + '_input" class="__rdly-slider-input" type="text"/>\
							<div id="__rdly_' + idName + '_slider" class="__rdly-slider"></div>\
						</div>\
					</div>')
		};  // End wSets._oneSetting()

		wSets._addNodes = function () {

			var one = wSets._oneSetting;

			// Maybe this should belong to something else - a settings manager
			var $menu = $('<div id="__rdly_word_settings_menu"></div>');
			wSets.node = $menu[0];

			wSets._nodes.menu = $menu[0];
			one( 'maxchars', 'Max Letters Shown' ).appendTo($menu);

			return wSets;
		};  // End wSets._addNodes()


		wSets._init = function ( coreSettings ) {

			wSets._addNodes( coreSettings );
			// Have to add this to the iframe DOM /before/ setting up the
			// slider, otherwise wrong #document owns it
			coreSettings.addMenu( wSets );

			wSets._assignSettingItems();
			wSets._makeSliders();

			// Events assigned with noUiSlider creation

			return wSets;
		};



		// =========== ADD NODE, ETC. =========== \\
		// Don't show at start, only when prompted
		wSets._init( coreSettings );

		// To be called in a script
		return wSets;
	};  // End WordSettings() -> {}

	// To put on the window object, or export into a module
    return WordSettings;
}));
