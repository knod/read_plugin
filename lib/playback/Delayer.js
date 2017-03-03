/* Delayer.js
* 
* Holding the changing user delay settinga and mananging
* the calculation of the delay till the current word is
* changed.
*/

(function (root, delayFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( [], function () {
        	return ( root.Delayer = delayFactory() );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = delayFactory();
    } else {
        // Browser globals
        root.Delayer = delayFactory();
    }
}(this, function () {

	"use strict";

	var Delayer = function ( settings, storage ) {
	/* ( {}, {} ) -> Delay
	* 
	*/
		var rDel = {};

		var _rSetts = rDel._settings = {
			wpm: 			250,
			slowStartDelay: 5,
			sentenceDelay: 	5,
			otherPuncDelay: 2.5,
			shortWordDelay: 1.3,
			longWordDelay: 	1.5,
			numericDelay: 	2.0
		};


		// ============== RUNTIME ============== \\

		rDel.calcDelay = function ( frag, justOnce ) {
		/* ( str, [bool] ) -> num
		* 
		*/
			var processed = rDel._process( frag );

			var delay = rDel.delay;
			if ( processed.hasPeriod ) 	  delay *= _rSetts.sentenceDelay;
			if ( processed.hasOtherPunc ) delay *= _rSetts.otherPuncDelay;
			if ( processed.isShort() ) 	  delay *= _rSetts.shortWordDelay;
			if ( processed.isLong() ) 	  delay *= _rSetts.longWordDelay;
			if ( processed.isNumeric ) 	  delay *= _rSetts.numericDelay;

			// Just after starting up again, go slowly, then speed up a bit
			// each time the loop is called
			var extraDelay = rDel._tempSlowStart;
			// Make sure startDelay isn't used up by things like .once() called
			// repeatedly, like when the scrubber is moved.
			if (!justOnce) {rDel._tempSlowStart = Math.max( 1, extraDelay / 1.5 );}
			delay = delay * rDel._tempSlowStart;
			// Once is true all the time

			return delay;
		};  // End rDel.calcDelay()


		rDel.resetSlowStart = function ( val ) {
		/* ( num ) -> Delayer
		* 
		* For after restart or pause, assign a value to start the
		* text off slowly to warm the reader up to full speed.
		*/
			if ( val ) { rDel._tempSlowStart = val; }
			else { rDel._tempSlowStart = _rSetts.slowStartDelay; }
			return rDel;
		};


		// ======= PROCESSING STRING ======== \\
		rDel._process = function ( chars ) {
		/* ( str ) -> {}
		* 
		* Assesses the properties of a string, saving them in an object
		*/
			var frag = { chars: chars };

	        rDel._setPuncProps( frag );

			// TODO: Get from custom user settings
			var shortLength = 2,
				longLength 	= 8;

			// TODO: Change to non-functions when you have a min
			frag.isShort = function () { return chars.length <= shortLength; };
	        frag.isLong = function () { return chars.length >= longLength; };

			frag.isNumeric = /\d/.test(chars);

			return frag;
		};  // End rDel._process()


		rDel._setPuncProps = function ( frag ) {
		/* ( Str ) -> {}
		* 
		* Tests and sets the punctuation properties
		*/
			var str = frag.chars;

			frag.hasPeriod 	  = /[.!?]/.test(str);
			// TODO: test for non-alphameric/period characters
			frag.hasOtherPunc = /["'()”’:;,_]/.test(str);

			return rDel;
		};  // end rDel._setPuncProps()


		// ============== SET OPTIONS ============== \\

		// Not needed, but might be nice to have:
		rDel.settingsAvailable = ['wpm', 'sentenceDelay', 'otherPuncDelay', 'shortWordDelay',
								  'longWordDelay', 'numericDelay', 'slowStartDelay'];

		rDel.set = function ( settingName, value ) {
			// ??: Convert all to lowercase instead? If we use of lowercase,
			// we can remove at least some typo mistakes and uncertainties.

			if ( !_rSetts[ settingName ] ) {
				console.error('There is no approved setting by the name of "' + settingName + '". Maybe check your capitalization. Also, you can check `yourDelayerObj.settingsAvailable` to see what setting names are available to you.');
				return false;
			}
			
			var val = rDel[ '_get' + settingName ]( value ); // normalize value
			_rSetts[ settingName ] = val; // Save locally

			// Save in long term memmory
			// Make it possible to use settingName as a key instead of the literal word "settingName"
			var toSave 				= {};
			toSave[ settingName ] 	= val;
			storage.set( toSave );  // ??: Should this be all lowercase too?

			return rDel;
		};  // End rDel.set()


		rDel._withinLimits = function ( val, min, max ) {
			var minLimited = Math.max( min, val );
			return Math.min( max, minLimited );
		};

		rDel._toUsefulVal = function ( val, min, max ) {
			var num = parseFloat(val);
			return rDel._withinLimits( num, min, max );
		};


		rDel._getwpm = function ( val ) {
			var wpm = rDel._toUsefulVal( val, 1, 5000 );
			// Convert words per minute to milliseconds
			rDel.delay = 1/(wpm/60)*1000;
			return wpm;
		};
		rDel._getslowStartDelay = function ( val ) {
			return rDel._toUsefulVal( val, 0, 10 );
		};
		rDel._getsentenceDelay = function ( val ) {
			return rDel._toUsefulVal( val, 1, 10 );
		};
		rDel._getotherPuncDelay = function ( val ) {
			return rDel._toUsefulVal( val, 1, 10 );
		};
		rDel._getshortWordDelay = function ( val ) {
			return rDel._toUsefulVal( val, 1, 10 );
		};
		rDel._getlongWordDelay = function ( val ) {
			return rDel._toUsefulVal( val, 1, 10 );
		};
		rDel._getnumericDelay = function ( val ) {
			return rDel._toUsefulVal( val, 1, 10 );
		};



        // ============== DO IT ============== \\

		rDel._init = function ( settings ) {
		// Update local and long term memory settings based on what's passed in
		// Also normalizes values before saving them
			for ( let key in _rSetts ) {
				let val = settings[key] || _rSetts[key];
				rDel.set( key, val );
			}
			return rDel;
		};  // End rDel._init()

		rDel._init( settings )



		return rDel;
	};  // End Delay() -> {}

    return Delayer;
}));
