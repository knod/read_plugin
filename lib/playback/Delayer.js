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

	var Delayer = function ( settings ) {
	/* ( {} ) -> Delay
	* 
	*/
		var rDel = {};

		var _rSetts = rDel._settings = settings._settings;


		// ============== RUNTIME ============== \\

		rDel.calcDelay = function ( frag, justOnce ) {
		/* ( str, [bool] ) -> Float
		* 
		*/
			var processed = rDel._process( frag );

			var delay = _rSetts._baseDelay;
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



		return rDel;
	};  // End Delay() -> {}

    return Delayer;
}));
