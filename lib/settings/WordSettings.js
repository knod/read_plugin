/* WordSettings.js
* 
* UI elements for setting various word features, like
* max number of displayed characters.
*/

(function (root, wordSetsFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( ['jquery', 'nouislider'], function ( jquery, nouislider ) {
        	return ( root.WordSettings = wordSetsFactory( jquery ) );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = wordSetsFactory( require('jquery'), require('nouislider') );
    } else {
        // Browser globals
        root.WordSettings = wordSetsFactory( root.jQuery, root.noUiSlider );  // not sure noUi is here
    }
}(this, function ( $, noUiSlider ) {

	"use strict";

	var WordSettings = function ( fragmentor, coreSettings ) {

		var wSets = {};

		wSets.node 	  = null;
		wSets.tabText = 'Words';

		wSets._nodes  = {};
		var nodes 	  = wSets._nodes;

		nodes.maxCharsInput 	= null;
		nodes.maxCharsSlider 	= null;
		// nodes.slowStartInput 		= null;
		// nodes.slowStartSlider 		= null;
		// nodes.sentenceDelayInput 	= null;
		// nodes.sentenceDelaySlider 	= null;
		// nodes.puncDelayInput 		= null;
		// nodes.puncDelaySlider 		= null;
		// nodes.shortWordDelayInput 	= null;
		// nodes.shortWordDelaySlider 	= null;
		// nodes.longWordDelayInput 	= null;
		// nodes.longWordDelaySlider 	= null;
		// nodes.numericDelayInput 	= null;
		// nodes.numericDelaySlider 	= null;


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
				// Not sure the below does anything
				serialization: {
					to: [data.inputNode],
					resolution: data.resolution
				}
			});

			data.sliderNode.noUiSlider.on('update', function( values, handle ) {
				data.inputNode.value = values[handle];
				fragmentor.set( data.setting, values[handle] );
			});

			data.inputNode.addEventListener('change', function(){
				data.sliderNode.noUiSlider.set(this.value);
				fragmentor.set( data.setting, this.value );
			});

			return data.sliderNode;
		};  // End wSets._oneSlider()


		wSets._makeSliders = function () {

			var slider 	= wSets._oneSlider,
				nodes 	= wSets._nodes,
				setts 	= fragmentor._settings;

			slider({
				sliderNode: nodes.maxCharsSlider,
				range: 		{ min: 1, max: 25 },
				startVal: 	setts.maxNumCharacters,
				step: 		1,
				inputNode: 	nodes.maxCharsInput,
				resolution: 1,
				setting: 	'maxNumCharacters'
			});

			return wSets;
		};  // End wSets._makeSliders()


		wSets._assignSettingItems = function () {

			var nodes = wSets._nodes,
				$menu = $(nodes.menu);

			nodes.maxCharsInput 	= $menu.find('#__rdly_maxchars_input')[0];
			nodes.maxCharsSlider 	= $menu.find('#__rdly_maxchars_slider')[0];
			// nodes.slowStartInput 		= $menu.find('#__rdly_slowstart_input')[0];
			// nodes.slowStartSlider 		= $menu.find('#__rdly_slowstart_slider')[0];
			// nodes.sentenceDelayInput 	= $menu.find('#__rdly_sentencedelay_input')[0];
			// nodes.sentenceDelaySlider 	= $menu.find('#__rdly_sentencedelay_slider')[0];
			// nodes.puncDelayInput 		= $menu.find('#__rdly_puncdelay_input')[0];
			// nodes.puncDelaySlider 		= $menu.find('#__rdly_puncdelay_slider')[0];
			// nodes.shortWordDelayInput 	= $menu.find('#__rdly_shortworddelay_input')[0];
			// nodes.shortWordDelaySlider 	= $menu.find('#__rdly_shortworddelay_slider')[0];
			// nodes.longWordDelayInput 	= $menu.find('#__rdly_longworddelay_input')[0];
			// nodes.longWordDelaySlider 	= $menu.find('#__rdly_longworddelay_slider')[0];
			// nodes.numericDelayInput 		= $menu.find('#__rdly_numericdelay_input')[0];
			// nodes.numericDelaySlider 	= $menu.find('#__rdly_numericdelay_slider')[0];

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

		wSets._addNodes = function ( coreSettings ) {

			var one = wSets._oneSetting;

			// Maybe this should belong to something else - a settings manager
			var $menu = $('<div id="__rdly_word_settings_menu"></div>');
			wSets.node = $menu[0];

			coreSettings.addMenu( wSets );

			wSets._nodes.menu = $menu[0];

			one( 'maxchars', 'Max Letters Shown' ).appendTo($menu);
			// one( 'slowstart', 'Slow Start Speed' ).appendTo($menu);
			// one( 'sentencedelay', 'Sentence Delay' ).appendTo($menu);
			// one( 'puncdelay', 'Other Punctuation Delay' ).appendTo($menu);
			// one( 'shortworddelay', 'Short Word Delay' ).appendTo($menu);
			// one( 'longworddelay', 'Long Word Delay' ).appendTo($menu);
			// one( 'numericdelay', 'Numeric Delay' ).appendTo($menu);

			return wSets;
		};  // End wSets._addNodes()


		wSets._init = function ( coreSettings ) {

			wSets._addNodes( coreSettings );
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
