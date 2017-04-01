/* PlaybackUI.js
* 
* Pause, play, rewind, fast-forward, and scrub
* controls. Includes progress bar. Name is not
* accurate, but it is clear and recognizable.
* 
* Based on https://github.com/jamestomasino/read_plugin/blob/master/Read.js
*/

(function (root, playbackFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( ['jquery', '@knod/nouislider', 'playback/playback-css'], function ( jquery, nouislider, playbackCSS ) {
        	return ( root.PlaybackUI = playbackFactory( jquery, nouislider, playbackCSS ) );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = playbackFactory( require('jquery'), require('@knod/nouislider'), require('./playback-CSS') );
    } else {
        // Browser globals
        root.PlaybackUI = playbackFactory( root.jQuery, root.noUiSlider, root.playbackCSS );  // not sure noUi is here
    }
}(this, function ( $, noUiSlider, playbackCSSstr ) {

	"use strict";

	var PlaybackUI = function ( timer, coreDisplay ) {

		var rPUI = {};

		rPUI.modifierKeysDown = [];  // Will be emptied when app is closed
		rPUI.sentenceModifierKey = 18;  // 'alt'

		rPUI.isOpen 	 = false;
		rPUI.isPlaying 	 = false;
		rPUI.isScrubbing = false;
		rPUI.nodes 		 = {};
		var nodes 		 = rPUI.nodes;

		var progressNode, percentDone, scrubber;
		var indicator, textButton, loading;
		var playPauseFeedback, playFeedback, pauseFeedback;
		var controls;  // We'll see how this one shapes up
		var rewindSentence;
		var nonCharRegEx = /[.,\/@#!$%\^&\*;:{}\+=\-_`~()'"\[\]<>\|\\]/g;

		var progStr = '<div id="__rdly_progress"></div>';

		var indicatorStr 	= '<div id="__rdly_indicator" class="__rdly-transform-centered"></div>',
			textButtonStr 	= '<button id="__rdly_text_button" class="__rdly-transform-centered"><span class="__rdly-text-content"></span><span class="__rdly-text-content"></span><span class="__rdly-text-content"></span></button>',
			loadingStr 		= '<div id="__rdly_loading" class="__rdly-hidden"></div>';

		var feedbackStr = '<div id="__rdly_play_pause_feedback" class="__rdly-transform-centered">\
	<div id="__rdly_pause_feedback" class="__rdly-playback-feedback __rdly-transform-centered">||</div>\
	<div id="__rdly_play_feedback" class="__rdly-playback-feedback __rdly-transform-centered">></div>\
</div>';

// 		var controlsStr = '<div id="__rdly_playback_controls">\
// 	<button id="__rdly_rewind_sentence" class="__rdly-playback-button"></button>\
// 	<button id="__rdly_rewind_word" class="__rdly-playback-button"></button>\
// 	<button id="__rdly_fastforward_word" class="__rdly-playback-button"></button>\
// 	<button id="__rdly_fastforward_sentence" class="__rdly-playback-button"></button>\
// </div>';

		var browser = chrome || browser,
			rewPath = browser.extension.getURL('images/rewind.svg');
		// TODO: Credit for icon (color altered): <div>Icons made by <a href="http://www.flaticon.com/authors/madebyoliver" title="Madebyoliver">Madebyoliver</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
		var rewindSentenceStr = '<button id="__rdly_rewind-sentence" class="__rdly-big-menu-button">\
	<img src="' + rewPath + '"></img>\
</button>';



		// =========== RUNTIME ACTIONS =========== \\

		rPUI.clear = function () {
			rPUI.modifierKeysDown = [];
			return rPUI;
		};
		rPUI.open = function () {
			rPUI.isOpen = true;
			return rPUI;
		};
		rPUI.close = function () {
			rPUI.isOpen = false;
			return rPUI;
		};

		rPUI.hideText = function () {
			$(textButton).addClass('__rdly-hidden');
			return rPUI;
		};


		rPUI.showText = function () {
			$(textButton).removeClass('__rdly-hidden');
			return rPUI;
		};


		rPUI.wait = function () {
			rPUI.hideText();
			$(loading).addClass('__rdly-rotating');
			$(loading).removeClass('__rdly-hidden');
			return rPUI;
		};


		rPUI.stopWaiting = function () {
			$(loading).addClass('__rdly-hidden');
			$(loading).removeClass('__rdly-rotating');
			rPUI.showText();
			return rPUI;
		};


		rPUI.clearText = function () {
			$(textButton).html("");
			return rPUI;
		};



		// ----- DOM EVENTS ----- \\
		rPUI._play = function () {
			$(playFeedback).removeClass('__rdly-hidden');
			$(pauseFeedback).addClass('__rdly-hidden');
			// https://jsfiddle.net/aL7kxe78/3/ fadeOut (ends with display: none)
			// http://stackoverflow.com/a/4549418/3791179 <- opacity
			var x = $(playPauseFeedback).fadeTo(0, 0.7).fadeTo(700, 0)
			return rPUI;
		}

		rPUI._pause = function () {
			$(pauseFeedback).removeClass('__rdly-hidden');
			$(playFeedback).addClass('__rdly-hidden');
			$(playPauseFeedback).fadeTo(0, 0.7).fadeTo(700, 0)
			return rPUI;
		}

		rPUI._togglePlayPause = function () {
			timer.togglePlayPause();
			return rPUI;
		};


		rPUI._rewindSentence = function () {
			timer.prevSentence();
			return rPUI;
		};


		// ----- TIMER EVENTS ----- \\
		
		/* 
			Moves one character (letter) from the middle string to start string and
			one character from end string into middle string
		*/
		rPUI._shiftCharacter = function(firstString, middleString, endString){
			startText += middleText;
			middleText = endText.substring(0,1);
			endText = endText.substring(1);
		}

		var whiteSpaceRegexp = /[\n\r\s]/;
		var paragraphSymbol  = '<span class="__rdly-text-content"></span><span class="__rdly-text-content"></span><span class="__rdly-text-content"></span>';
		rPUI._showNewFragment = function ( evnt, timer, fragment ) {
			var chars = fragment;
			// Adds pauses for line breaks
			// TOOD: Deal with line breaks in timer instead?
			if ( !whiteSpaceRegexp.test(chars) ) {
				var spans = textButton.querySelectorAll('.__rdly-text-content');
				var startSpan = spans[0];
				var middleSpan = spans[1];
				var endSpan = spans[2];

				var startText, middleText, endText;

				// Gets fragment without punctuation characters that won't count
				// towards its total length.
				var noPunctuationLength = chars.replace(nonCharRegEx, '').length;

				if(noPunctuationLength >= 10) {
					startText = chars.substring(0,3);
					middleText = chars.substring(3,4);
					endText = chars.substring(4);
				} else if(noPunctuationLength >= 7) {
					startText = chars.substring(0,2);
					middleText = chars.substring(2,3);
					endText = chars.substring(3);
				}
				else if(noPunctuationLength>=2) {
					startText = chars.substring(0,1);
					middleText = chars.substring(1,2);
					endText = chars.substring(2);
				} else{
					startText = "";
					middleText = chars;
					endText = "";
				}

				//In the case we only have one letter we won't shift at all
				if(noPunctuationLength>=2){
					/*If we start off with symbols we want them not to count for the indicator position so we will shift things appropriately.  Find number of non character symbols in startText and shift that many symbols left through the middle and end text. */
					var symbolsInStart = startText.match(nonCharRegEx);
					if(symbolsInStart){
						for (var i = 0; i < symbolsInStart.length; i++) {
							rPUI._shiftCharacter(startText,middleText,endText);
						}
					}

					//If we end up with the middle character not being a letter shift over one until we end up at a non symbol
					while(middleText.match(nonCharRegEx) && endText.length>0){
						rPUI._shiftCharacter(startText,middleText,endText);
					}	
				}

				startSpan.innerHTML = startText;
				middleSpan.innerHTML = middleText;
				endSpan.innerHTML = endText;


				var startWidth = startSpan.offsetWidth;
				var middleWidth = middleSpan.offsetWidth;
				var endWidth = endSpan.offsetWidth;

				var halfWidth = (startWidth+middleWidth+endWidth)/2;

				// Minus is right Plus is left. First we shift the word right so the indicator is before the first letter in the word, then we shift the word left by the first part of the word plus half of the width of the middle letter putting the indicator under the appropriate target letter
				var textOffset = (-halfWidth+startWidth+middleWidth/2);

				// Whew! done calculating things now position the text
				textButton.style.left = 'calc(50% - '+ textOffset +'px)';
			} else {
				$(textButton).html( paragraphSymbol );
			}
			rPUI.stopWaiting();
			return rPUI;
		};


		rPUI._showProgress = function ( evnt, timer, fraction, indx, total ) {
		// TODO: Needs some work
			if ( !rPUI.isScrubbing ) {  // Don't mess timing up with transitions
				progressNode.noUiSlider.set( indx );  // version 8 nouislider
			}
			return rPUI;
		};


		rPUI._start = function () {
			progressNode.noUiSlider.updateOptions({
				range: { min: 0, max: (timer.getLength() - 1) }
			});
			return rPUI;
		}


		// --------- SCRUBBER EVENTS --------- \\
		rPUI._startScrubbing = function ( values, handle ) {
			rPUI.isScrubbing = true;
			return rPUI;
		};  // End rPUI._startScrubbing()


		rPUI._updateScrubbedWords = function ( values, handle ) {
			timer.jumpTo({
				type: 'index',
				amount: parseInt(values[handle])
			});
			return rPUI;
		};  // End rPUI._updateScrubbedWords()


		rPUI._stopScrubbing = function ( values, handle ) {
			rPUI.isScrubbing = false;
			timer.disengageJumpTo();
			return rPUI;
		};  // End rPUI._stopScrubbing()


		rPUI.keyUp = function ( evnt ) {

			// If it was closed, the list of keys down is destroyed anyway
			if (!rPUI.isOpen) { return rPUI; };

			var keyCode = evnt.keyCode || evnt.which || evnt.charCode;
			var smod 	= rPUI.sentenceModifierKey;

			// Modifier keys
			if ( keyCode === smod ) {

				var smodi = rPUI.modifierKeysDown.indexOf( smod );
				if ( smodi > -1 ) { rPUI.modifierKeysDown.splice( smodi ) }
			}

			return rPUI;
		};  // End rPUI.keyUp()


		rPUI.keyDown = function ( evnt ) {

			// If the app isn't open, don't want to get errors for trying
			// to do impossible stuff and don't want to change position in text
			if (!rPUI.isOpen) { return rPUI; };

			var keyCode = evnt.keyCode || evnt.which || evnt.charCode;
			var smod = rPUI.sentenceModifierKey;

			// Modifier keys
			if ( keyCode === smod && rPUI.modifierKeysDown.indexOf( smod ) === -1 ) {
				rPUI.modifierKeysDown.push( smod )
			}

			if ( rPUI.modifierKeysDown.indexOf( smod ) > -1 ) {
				if ( keyCode === 39 ) { timer.nextSentence(); }
				else if ( keyCode === 37 ) { timer.prevSentence(); }
			} else {
				if ( keyCode === 39 ) { timer.nextWord(); }
				else if ( keyCode === 37 ) { timer.prevWord(); }
			}

			return rPUI;
		};  // End rPUI.keyDown()


		// =========== INITIALIZE =========== \\

		rPUI._progressSlider = function ( progNode ) {
		/* ( DOM Node ) -> same DOM Node
		* 
		* Turn the given data into one noUiSlider slider
		*/
			// To keep handles within the bar
			$(progNode).addClass('noUi-extended');

			var slider = noUiSlider.create( progNode, {
				range: { min: 0, max: 1 },
				start: 0,
				step: 1,
				connect: [true, false],
				handles: 1,
				behaviour: 'tap'
			});

			return progNode;
		};  // End rPUI._progressSlider()


		rPUI._addEvents = function () {
			// Timer events
			$(timer).on('playBegin', rPUI._play);
			$(timer).on('pauseFinish', rPUI._pause);
			$(timer).on( 'startFinish', rPUI._start );
			$(timer).on( 'newWordFragment', rPUI._showNewFragment );
			$(timer).on( 'progress', rPUI._showProgress );

			// Scrubber events
			progressNode.noUiSlider.on( 'start', rPUI._startScrubbing );
			progressNode.noUiSlider.on( 'slide', rPUI._updateScrubbedWords );
			progressNode.noUiSlider.on( 'change', rPUI._stopScrubbing );

			// DOM events
			$(textButton).on( 'touchend click', rPUI._togglePlayPause );
			$(rewindSentence).on( 'touchend click', rPUI._rewindSentence );

			// Keyboard input
			// Arrow keys only listen to the keydown and keyup event, not keypress
			$(coreDisplay.nodes.doc).on( 'keydown', rPUI.keyDown );
			$(coreDisplay.nodes.doc).on( 'keyup', rPUI.keyUp );
			$(document.body).on( 'keydown', rPUI.keyDown );
			$(document.body).on( 'keyup', rPUI.keyUp );

			return rPUI;
		};  // End rPUI._addEvents()


		rPUI._init = function ( coreDisplay ) {

			rPUI.modifierKeysDown = [];  // TODO: Empty non-destructively
			rPUI.sentenceModifierKey = 18;  // 'alt' TODO: Modifiable?

			progressNode = nodes.progressNode = $(progStr)[0];
			rPUI._progressSlider( progressNode );

			indicator = nodes.indicator = $(indicatorStr)[0];
			// ??: Should this really be a button? How do the rest of the controls fit into this?
			// ??: Should there just be an invisible set of controls that accessible aids can grab hold of
			textButton 	= nodes.textButton 	= $(textButtonStr)[0];
			loading 	= nodes.loading 	= $(loadingStr)[0];

			playPauseFeedback 	= nodes.playPauseFeedback 	= $(feedbackStr)[0];
			playFeedback 		= nodes.playFeedback  		= $(playPauseFeedback).find('#__rdly_play_feedback')[0];
			pauseFeedback 		= nodes.pauseFeedback 		= $(playPauseFeedback).find('#__rdly_pause_feedback')[0];

			// // Go in .rdly-bar-center .rdly-below?
			// controls = nodes.controls = $(controlsStr)[0];

			rewindSentence = nodes.rewindSentence = $(rewindSentenceStr)[0];

			var coreNodes = coreDisplay.nodes;
			$(progressNode).appendTo( coreNodes.above );
			$(playPauseFeedback).appendTo( coreNodes.barCenter );

			$(indicator).appendTo( coreNodes.textElements );
			$(textButton).appendTo( coreNodes.textElements );
			$(loading).appendTo( coreNodes.textElements );
			
			$(controls).appendTo( coreNodes.bar );
			$(rewindSentence).appendTo( coreNodes.barLeft );

			// STYLES
			playbackCSSstr 	= '<style>' + playbackCSSstr + '</style>';
			var $css 		= $(playbackCSSstr);
			$css.appendTo( coreNodes.head );


			coreDisplay.addToTriggerList( rPUI );


			rPUI._addEvents();

			return rPUI;
		};  // End rPUI._init()


		// =========== ADD NODE, ETC. =========== \\
		// Don't show at start, only when prompted
		rPUI._init( coreDisplay );

		// To be called in a script
		return rPUI;
	};  // End PlaybackUI() -> {}

	// To put on the window object, or export into a module
    return PlaybackUI;
}));
