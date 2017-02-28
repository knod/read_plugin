/* SpeedSettings.js
* 
* UI elements for setting various speeds/delays for
* certain characteristics of words, like length and
* punctuation.
* 
* Based on https://github.com/jamestomasino/read_plugin/blob/master/Read.js
*/

(function (root, speedsFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( ['jquery', 'nouislider'], function ( jquery, nouislider ) {
        	return ( root.SpeedSettings = speedsFactory( jquery ) );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = speedsFactory( require('jquery'), require('nouislider') );
    } else {
        // Browser globals
        root.SpeedSettings = speedsFactory( root.jQuery, root.noUiSlider );  // not sure noUi is here
    }
}(this, function ( $, noUiSlider ) {

	"use strict";

	var SpeedSettings = function ( delayer, coreSettings ) {

		var rSpd = {};

		rSpd.node 	 = null;
		rSpd.id 	 = 'speedSettings';
		rSpd.tabText = 'Speeds';

		rSpd._nodes  = {};
		var nodes 	 = rSpd._nodes;

		nodes.wpmInput 				= null;
		nodes.wpmSlider 			= null;
		nodes.slowStartInput 		= null;
		nodes.slowStartSlider 		= null;
		nodes.sentenceDelayInput 	= null;
		nodes.sentenceDelaySlider 	= null;
		nodes.puncDelayInput 		= null;
		nodes.puncDelaySlider 		= null;
		nodes.shortWordDelayInput 	= null;
		nodes.shortWordDelaySlider 	= null;
		nodes.longWordDelayInput 	= null;
		nodes.longWordDelaySlider 	= null;
		nodes.numericDelayInput 	= null;
		nodes.numericDelaySlider 	= null;


		rSpd._oneSlider = function ( data ) {
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
				delayer.set( data.operation, values[handle] );
			});

			data.inputNode.addEventListener('change', function(){
				data.sliderNode.noUiSlider.set(this.value);
				delayer.set( data.operation, this.value );
			});

			return data.sliderNode;
		};  // End rSpd._oneSlider()


		rSpd._makeSliders = function () {

			var slider 	= rSpd._oneSlider,
				nodes 	= rSpd._nodes,
				setts 	= delayer._settings;

			slider({
				sliderNode: nodes.wpmSlider,
				range: 		{ min: 1, max: 1500 },
				startVal: 	setts.wpm,
				step: 		25,
				inputNode: 	nodes.wpmInput,
				resolution: 1,
				operation: 	'wpm'
			});

			slider({
				sliderNode: nodes.slowStartSlider,
				range: 		{ min: 0, max: 20 },
				startVal: 	setts.slowStartDelay,
				step: 		1,
				inputNode: 	nodes.slowStartInput,
				resolution: 1,
				operation: 	'slowStartDelay'
			});

			slider({
				sliderNode: nodes.sentenceDelaySlider,
				range: 		{ min: 0, max: 5 },
				startVal: 	setts.sentenceDelay,
				step: 		0.1,
				inputNode: 	nodes.sentenceDelayInput,
				resolution: 0.1,
				operation: 	'sentenceDelay'
			});

			slider({
				sliderNode: nodes.puncDelaySlider,
				range: 		{ min: 0, max: 5 },
				startVal: 	setts.otherPuncDelay,
				step: 		0.1,
				inputNode: 	nodes.puncDelayInput,
				resolution: 0.1,
				operation: 	'otherPuncDelay'
			});

			slider({
				sliderNode: nodes.shortWordDelaySlider,
				range: 		{ min: 0, max: 5 },
				startVal: 	setts.shortWordDelay,
				step: 		0.1,
				inputNode: 	nodes.shortWordDelayInput,
				resolution: 0.1,
				operation: 	'shortWordDelay'
			});

			slider({
				sliderNode: nodes.longWordDelaySlider,
				range: 		{ min: 0, max: 5 },
				startVal: 	setts.longWordDelay,
				step: 		0.1,
				inputNode: 	nodes.longWordDelayInput,
				resolution: 0.1,
				operation: 	'longWordDelay'
			});

			slider({
				sliderNode: nodes.numericDelaySlider,
				range: 		{ min: 0, max: 5 },
				startVal: 	setts.numericDelay,
				step: 		0.1,
				inputNode: 	nodes.numericDelayInput,
				resolution: 0.1,
				operation: 	'numericDelay'
			});

			return rSpd;
		};  // End rSpd._makeSliders()


		rSpd._assignSettingItems = function () {

			var nodes = rSpd._nodes,
				$menu = $(nodes.menu);

			nodes.wpmInput 				= $menu.find('#__rdly_wpm_input')[0];
			nodes.wpmSlider 			= $menu.find('#__rdly_wpm_slider')[0];
			nodes.slowStartInput 		= $menu.find('#__rdly_slowstart_input')[0];
			nodes.slowStartSlider 		= $menu.find('#__rdly_slowstart_slider')[0];
			nodes.sentenceDelayInput 	= $menu.find('#__rdly_sentencedelay_input')[0];
			nodes.sentenceDelaySlider 	= $menu.find('#__rdly_sentencedelay_slider')[0];
			nodes.puncDelayInput 		= $menu.find('#__rdly_puncdelay_input')[0];
			nodes.puncDelaySlider 		= $menu.find('#__rdly_puncdelay_slider')[0];
			nodes.shortWordDelayInput 	= $menu.find('#__rdly_shortworddelay_input')[0];
			nodes.shortWordDelaySlider 	= $menu.find('#__rdly_shortworddelay_slider')[0];
			nodes.longWordDelayInput 	= $menu.find('#__rdly_longworddelay_input')[0];
			nodes.longWordDelaySlider 	= $menu.find('#__rdly_longworddelay_slider')[0];
			nodes.numericDelayInput 	= $menu.find('#__rdly_numericdelay_input')[0];
			nodes.numericDelaySlider 	= $menu.find('#__rdly_numericdelay_slider')[0];

			return rSpd;
		};  // End rSpd._assignSettingItems()

		rSpd._oneSetting = function ( idName, label ) {
			// Should the very specific classes be ids?
			return $('<div id="__rdly_' + idName + '_setting" class="__rdly-setting">\
						<label class="__rdly-slider-label">' + label + '</label>\
						<div class="__rdly-slider-controls">\
							<input id="__rdly_' + idName + '_input" class="__rdly-slider-input" type="text"/>\
							<div id="__rdly_' + idName + '_slider" class="__rdly-slider"></div>\
						</div>\
					</div>')
		};  // End rSpd._oneSetting()

		rSpd._addNodes = function ( coreSettings ) {

			var one = rSpd._oneSetting;

			// Maybe this should belong to something else - a settings manager
			var $menu = $('<div id="__rdly_speed_settings_menu"></div>');
			rSpd.node = $menu[0];

			coreSettings.addMenu( rSpd );

			rSpd._nodes.menu = $menu[0];

			one( 'wpm', 'Words Per Minute' ).appendTo($menu);
			one( 'slowstart', 'Slow Start Speed' ).appendTo($menu);
			one( 'sentencedelay', 'Sentence Delay' ).appendTo($menu);
			one( 'puncdelay', 'Other Punctuation Delay' ).appendTo($menu);
			one( 'shortworddelay', 'Short Word Delay' ).appendTo($menu);
			one( 'longworddelay', 'Long Word Delay' ).appendTo($menu);
			one( 'numericdelay', 'Numeric Delay' ).appendTo($menu);

			return rSpd;
		};  // End rSpd._addNodes()


		rSpd._init = function ( coreSettings ) {

			rSpd._addNodes( coreSettings );
			rSpd._assignSettingItems();
			rSpd._makeSliders();

			// Events assigned with noUiSlider creation

			return rSpd;
		};



		// =========== ADD NODE, ETC. =========== \\
		// Don't show at start, only when prompted
		rSpd._init( coreSettings );

		// To be called in a script
		return rSpd;
	};  // End SpeedSettings() -> {}

	// To put on the window object, or export into a module
    return SpeedSettings;
}));
