/* main.js
* 
* TODO:
* - Cache whole page text when possible/read
* - Cache options and prevent them from being reset on
* 	close of extension
* - Cache reading progress?
* - Trigger pause on clicking of central element, not
* 	just text
* - Add function "cleanHTML" to get rid of unwanted elements
* - Remove html parsing from sbd node module
* - Break this up into more descrete modules
* 
* WARNING:
* Storage is all user settings. Too cumbersome otherwise for now.
*/

(function(){

	// ============== SETUP ============== \\
	var unfluff 	= require('@knod/unfluff'),
		detect 		= require('detect-lang'),
		$ 			= require('jquery');

	// var Queue 		= require('./lib/Queue.js'),
	var Words 		= require('./lib/parse/Words.js'),
		WordNav 	= require('./lib/parse/WordNav.js'),
		Storage 	= require('./lib/ReaderlyStorage.js'),
		Delayer 	= require('./lib/playback/Delayer.js')
		Timer 		= require('./lib/playback/ReaderlyTimer.js'),
		Display 	= require('./lib/ReaderlyDisplay.js'),
		Playback 	= require('./lib/playback/PlaybackUI.js'),
		Settings 	= require('./lib/settings/ReaderlySettings.js'),
		Speed 		= require('./lib/settings/SpeedSettings.js');

	var words, wordNav, storage, delayer, timer, coreDisplay, playback, settings, speed;
	// var queue, storage, delayer, timer, coreDisplay, playback, settings, speed;


	var afterLoadSettings = function ( oldSettings ) {
		delayer 	= new Delayer( oldSettings, storage );
		timer 		= new Timer( delayer, oldSettings, storage );
		coreDisplay = new Display( timer );
		playback 	= new Playback( timer, coreDisplay );
		settings 	= new Settings( timer, coreDisplay );
		speed 		= new Speed( delayer, settings );
	};  // End afterLoadSettings()


	var addEvents = function () {
		$(timer).on( 'starting', function showLoading() { playback.wait(); })
	};  // End addEvents()


	var init = function () {
		// queue 	= new Queue();
		words 	= new Words();
		wordNav = new WordNav();
		storage = new Storage();
		storage.loadAll( afterLoadSettings );

		addEvents();
	};  // End init()


	// ============== START IT UP ============== \\
	init();



	// ============== RUNTIME ============== \\
	var read = function ( text ) {
		// TODO: If there's already a `words`, start where we left off
		words.process( text );
		console.log('~~~~~~~~~ If any of those tests failed, the problem isn\'t with Readerly, it\'s with one of the other libraries. That problem will have to be fixed later.');
		wordNav.process( words );
		timer.start( wordNav );
		return true;
	};


	var cleanHTML = function ( $node ) {
	// Remove unwanted nodes from the text
		$node.find('sup').remove();
		// These have English, skewing language detection results
		$node.find('script').remove();
		$node.find('style').remove();
		return $node;
	};


	var smallSample = function ( $node, desiredSampleLength ) {
	/* ( jQuery Node, [int] ) -> Str
	* 
	* Get a sample of the text (probably to use in detecting language)
	* A hack for language detection for now until language detection
	* is made lazy.
	*/
		var halfSampleLength = desiredSampleLength/2 || 500;

		var text = $node.text();
		text = text.replace(/\s\s+/g, ' ');

		// Average letter length of an English word = ~5 characters + a space
		var aproxNumWords 	= Math.floor(text.length/6),
			halfNumWords 	= aproxNumWords/2;

		// Want to get as close to 1k words as possible
		var startingPoint, length;
		if ( halfNumWords > halfSampleLength ) {
			length = halfSampleLength * 2;
			startingPoint = halfNumWords - halfSampleLength;
		} else {
			length = text.length;
			startingPoint = 0;
		}

		var sample = text.slice( startingPoint, startingPoint + length );

		return sample;
	};  // End smallSample()




	chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {

		coreDisplay.open();
		playback.wait();  // Do we need this?

		var func = request.functiontoInvoke;
		if ( func === "readSelectedText" ) {
			
			var contents = document.getSelection().getRangeAt(0).cloneContents();
			var container = $('<div></div>');
			container.append(contents);
			container.find('sup').remove();
			read( container.text() );

		} else if ( func === "readFullPage" ) {

			var $clone = $('html').clone(),
				$clean = cleanHTML( $clone );

			var sampleText = smallSample( $clean );

			detect( sampleText ).then(function afterLanguageDetection(data) {
				var lang = data.iso6391 || 'en',
					cmds = unfluff.lazy( $clean.html(), lang ),
					text = cmds.text();
				console.log('~~~~~~~~~ detect-language test. Has it detected the correct language?', lang);
				console.log('~~~~~~~~~ unfulff test. Is this showing the correct text?', text);
				read( text )
			});

		}  // end if event is ___

	});  // End event listener

})();
