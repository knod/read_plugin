/* main.js
* 
* TODO:
* - Cache whole page text when possible/read
* - Cache reading progress?
* - Remove html parsing from sbd node module
* - Break this up into more descrete modules
* - Combine Words.js and WordNav.js
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
		SpeedSets 	= require('./lib/settings/SpeedSettings.js'),
		WordSets 	= require('./lib/settings/WordSettings.js');

	var parser, fragmentor, words, wordNav, storage, delayer, timer, coreDisplay, playback, settings, speed;


	var addEvents = function () {
		$(timer).on( 'starting', function showLoading() { playback.wait(); })
	};  // End addEvents()


	var afterLoadSettings = function ( oldSettings ) {
		delayer 	= new Delayer( oldSettings, storage );
		timer 		= new Timer( delayer, oldSettings, storage );
		coreDisplay = new Display( timer );

		textElem 	= coreDisplay.nodes.textElements;
		fragmentor 	= new WordSplitter( textElem, oldSettings, storage );

		playback 	= new Playback( timer, coreDisplay );
		settings 	= new Settings( timer, coreDisplay );
		speedSets 	= new SpeedSets( delayer, settings );
		wordSets	= new WordSets( fragmentor, settings );

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
		parser.debug = false;

		words 	= new Words();
		wordNav = new WordNav();
		storage = new Storage();


		// !!!FOR DEBUGGING ONLY!!!
		if ( false ) {
			storage.clear()
			console.log('cleared storage');
		}

		storage.loadAll( afterLoadSettings );
	};  // End init()


	// ============== START IT UP ============== \\
	init();



	// ============== RUNTIME ============== \\
	var read = function ( node ) {

		var sentenceWords = parser.parse( node );  // returns [[Str]]

        if (parser.debug) {  // Help non-coder devs identify some bugs
    	    console.log('~~~~~parse debug~~~~~ If any of those tests failed, the problem isn\'t with Readerly, it\'s with one of the other libraries. That problem will have to be fixed later.');
        }
		
		wordNav.process( sentenceWords, fragmentor );
		timer.start( wordNav );
		return true;
	};


	var openReaderly = function () {
		coreDisplay.open();
		playback.wait();  // Do we need this?
	};


	var readSelectedText = function () {
		openReaderly();
		var contents = document.getSelection().getRangeAt(0).cloneContents();
		var $container = $('<div></div>');
		$container.append(contents);
		read( $container[0] );
	};


	var readArticle = function () {
		openReaderly();
		var $clone = $('html').clone();
		read( $clone[0] );
	};



	// ==============================
	// EXTENSION EVENT LISTENER
	// ==============================
	var browser = chrome || browser;

	browser.extension.onMessage.addListener(function (request, sender, sendResponse) {

		var func = request.functiontoInvoke;
		if ( func === "readSelectedText" ) { readSelectedText(); }
		else if ( func === "readFullPage" ) { readArticle(); }

	});  // End event listener

})();
