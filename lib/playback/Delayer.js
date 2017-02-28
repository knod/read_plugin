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

		var _rSetts = null;
		var defaultSettings = {
			wpm: 			500,
			slowStartDelay: 5,
			sentenceDelay: 	2.5,
			otherPuncDelay: 1.5,
			shortWordDelay: 1.3,
			longWordDelay: 	1.4,
			numericDelay: 	2.0
		};


		rDel._init = function ( settings ) {

			var wpm 			= settings.wpm 				|| defaultSettings.wpm,
				slowStartDelay 	= settings.slowStartDelay 	|| defaultSettings.slowStartDelay,
				sentenceDelay 	= settings.sentenceDelay 	|| defaultSettings.sentenceDelay,
				otherPuncDelay 	= settings.otherPuncDelay 	|| defaultSettings.otherPuncDelay,
				shortWordDelay 	= settings.shortWordDelay 	|| defaultSettings.shortWordDelay,
				longWordDelay 	= settings.longWordDelay 	|| defaultSettings.longWordDelay,
				numericDelay 	= settings.numericDelay 	|| defaultSettings.numericDelay;

			// !!!FOR DEBUGGING ONLY!!!
			if ( false ) storage.clear()
			
			// Update settings based on what's passed in
			_rSetts = rDel._settings = {};
			rDel.set( 'wpm', 			wpm 			)
				.set( 'slowStartDelay', slowStartDelay 	)
				.set( 'sentenceDelay', 	sentenceDelay 	)
				.set( 'otherPuncDelay', otherPuncDelay 	)
				.set( 'shortWordDelay', shortWordDelay 	)
				.set( 'longWordDelay', 	longWordDelay 	)
				.set( 'numericDelay', 	numericDelay 	);

			return rDel;
		};  // End rDel._init()



		// ============== RUNTIME ============== \\

		rDel.calcDelay = function ( frag, justOnce ) {
		/* ( Str || Obj, [bool] ) -> #
		* 
		*/
		// !!! TODO: `justOnce` is an issue because it's actually just whether
		// or not a function has been passed into the loop, nothing else
			var delay = rDel.delay;

			var processed = frag;
			// !!! TEMPORARY UNTIL CONVERTED TO ONLY STRINGS !!!
			// If a string was passed in instead of an object, assess the string
			if ( typeof frag === 'string' ) { processed = rDel._process( frag ); }
			var processed = rDel._process( frag );

			if ( processed.hasPeriod ) 	 delay 	*= _rSetts.sentenceDelay;
			if ( processed.hasOtherPunc ) delay *= _rSetts.otherPuncDelay;
			if ( processed.isShort() ) 	 delay 	*= _rSetts.shortWordDelay;
			if ( processed.isLong() ) 	 delay 	*= _rSetts.longWordDelay;
			if ( processed.isNumeric ) 	 delay 	*= _rSetts.numericDelay;

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
		/* (Num) -> Delayer
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
		/* ( Str ) -> {}
		* 
		* Assesses the properties of a string, saving them in an object
		*/
			var frag = { chars: chars };

	        rDel._setPuncProps( frag );

			// TODO: Get from storage (with callback)
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

		rDel.set = function ( settingName, value) {
			// If we just go off of lowercase, we can remove at
			// least some typo mistakes and uncertainties
			var op = '_set' + settingName;
			if ( !rDel[ op ] ) {
				console.error('There is no approved setting by the name of "' + operation + '". Maybe check your capitalization. Also, you can check `yourDelayerObj.settingsAvailable` to see what setting names are available to you.');
				return false;
			}
			
			// The value after it has been normalized
			var val = rDel[ op ]( value );

			// Create object for data so we can use the value of `op` as a key
			// instead of the literal word "op"
			var toSave 				= {};
			toSave[ settingName ] 	= val;
			storage.set( toSave );  // Should this be all lowercase too?

			// _rSetts[settingName] = val;

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



		rDel._setwpm = function ( val ) {
			_rSetts.wpm = rDel._toUsefulVal( val, 1, 5000 );
			rDel.delay = 1/(_rSetts.wpm/60)*1000;
			return _rSetts.wpm;
		};

		// ??: What do these numbers mean? It's not milliseconds, that's for sure.
		rDel._setslowStartDelay = function ( val ) {
			_rSetts.slowStartDelay = rDel._toUsefulVal( val, 0, 10 );
			return _rSetts.slowStartDelay;
		};
		rDel._setsentenceDelay = function ( val ) {
			_rSetts.sentenceDelay = rDel._toUsefulVal( val, 1, 10 );
			return _rSetts.sentenceDelay;
		};
		rDel._setotherPuncDelay = function ( val ) {
			_rSetts.otherPuncDelay = rDel._toUsefulVal( val, 1, 10 );
			return _rSetts.otherPuncDelay;
		};
		rDel._setshortWordDelay = function ( val ) {
			_rSetts.shortWordDelay = rDel._toUsefulVal( val, 1, 10 );
			return _rSetts.shortWordDelay;
		};
		rDel._setlongWordDelay = function ( val ) {
			_rSetts.longWordDelay = rDel._toUsefulVal( val, 1, 10 );
			return _rSetts.longWordDelay;
		};
		rDel._setnumericDelay = function ( val ) {
			_rSetts.numericDelay = rDel._toUsefulVal( val, 1, 10 );
			return _rSetts.numericDelay;
		};

        // ============== DO IT ============== \\
		rDel._init( settings )
		return rDel;
	};  // End Delay() -> {}

    return Delayer;
}));
