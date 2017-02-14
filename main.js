/* main.js
* 
* TODO:
* - Cache whole page text when possible/read
* - Cache reading progress?
* - Remove html parsing from sbd node module
* - Break this up into more descrete modules
* 
* DONE:
* - Cache options and prevent them from being reset on
* 	close of extension
* - Trigger pause on clicking of central element, not
* 	just text
* - Add function "cleanNode" to get rid of unwanted elements
* 
* 
* WARNING:
* Storage is all user settings. Too cumbersome otherwise for now.
*/

(function(){

	// ============== SETUP ============== \\
	var $ 			= require('jquery');

	var Parser 		= require('./lib/parse/Parser.js'),
		ParserSetup = require('./lib/ParserSetup.js');

	var Storage 	= require('./lib/ReaderlyStorage.js'),
		Words 		= require('./lib/parse/Words.js'),
		WordNav 	= require('./lib/parse/WordNav.js'),
		WordSplitter= require('./lib/parse/WordSplitter.js'),
		Delayer 	= require('./lib/playback/Delayer.js')
		Timer 		= require('./lib/playback/ReaderlyTimer.js'),
		Display 	= require('./lib/ReaderlyDisplay.js'),
		Playback 	= require('./lib/playback/PlaybackUI.js'),
		Settings 	= require('./lib/settings/ReaderlySettings.js'),
		Speed 		= require('./lib/settings/SpeedSettings.js');

	var parser, fragmentor, words, wordNav, storage, delayer, timer, coreDisplay, playback, settings, speed;


	var addEvents = function () {
		$(timer).on( 'starting', function showLoading() { playback.wait(); })
	};  // End addEvents()


	var afterLoadSettings = function ( oldSettings ) {
		delayer 	= new Delayer( oldSettings, storage );
		timer 		= new Timer( delayer, oldSettings, storage );
		coreDisplay = new Display( timer );
		playback 	= new Playback( timer, coreDisplay );
		settings 	= new Settings( timer, coreDisplay );
		speed 		= new Speed( delayer, settings );

		textElem 	= coreDisplay.nodes.textElements;
		fragmentor 	= new WordSplitter( textElem, storage );

		addEvents();
	};  // End afterLoadSettings()


	var getParser = function () {
		var pSup = new ParserSetup();
		// FOR TESTING
		pSup.debug = false;

		// Functions to pass to parser
		var cleanNode 		= pSup.cleanNode,
			detectLanguage 	= pSup.detectLanguage,
			findArticle 	= pSup.findArticle,
			cleanText 		= pSup.cleanText,
			splitSentences 	= pSup.splitSentences;

		return new Parser( cleanNode, detectLanguage, findArticle, cleanText, splitSentences );
	};  // End getParser()


	var init = function () {

		parser  = getParser();

		words 	= new Words();
		wordNav = new WordNav();  // Maybe pass Words to WordNav
		storage = new Storage();
		// TESTING
		storage.set({'maxNumCharacters': 10});
		storage.loadAll( afterLoadSettings );
	};  // End init()


	// ============== START IT UP ============== \\
	init();



	// ============== RUNTIME ============== \\
	var read = function ( node ) {

		var sentenceWords = parser.parse( node );  // [[Str]]
		// var sentences = parser.parse( node );
        if (parser.debug) {  // Help non-coder devs identify some bugs
    	    console.log('~~~~~parse debug~~~~~ If any of those tests failed, the problem isn\'t with Readerly, it\'s with one of the other libraries. That problem will have to be fixed later.');
        }

        // TODO: ??: Combine Words.js and WordNav.js since Words.js now does so little?

		// // TODO: If there's already a `words` (if this isn't new), start where we left off
		// var sentenceData = words.process( sentenceWords );
		// // words.process( sentences );
		
		wordNav.process( sentenceWords, fragmentor );
		// wordNav.process( sentenceData, fragmentor );
		// wordNav.process( words );
		timer.start( wordNav );
		return true;
	};




	chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {

		coreDisplay.open();
		playback.wait();  // Do we need this?

		var func = request.functiontoInvoke;
		if ( func === "readSelectedText" ) {
			
			var contents = document.getSelection().getRangeAt(0).cloneContents();
			var $container = $('<div></div>');
			$container.append(contents);
			read( $container[0] );

		} else if ( func === "readFullPage" ) {

			var $clone = $('html').clone();
			read( $clone[0] );

		}  // end if event is ___

	});  // End event listener

})();
