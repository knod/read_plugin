/* Fragment.js
* 
* Build the necessary data for one fragment/unit of
* the text (e.g. a unit that will be displayed on its
* own)
* 
* Based on https://github.com/jamestomasino/read_plugin/blob/master/ReadWord.js
* 
* TODO:
* ??: Include ability to set what lengths make words long or
* short? `frag.options = { shortLength: int, longLength: int }`
*/

(function (root, fragFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( [], function () { return ( root.Fragment = fragFactory() ); });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = fragFactory();
    } else {
        // Browser globals
        root.Fragment = fragFactory();
    }
}(this, function () {

	"use strict";

	var wordRegex = /\w/g;
	var numRegex  = /\d/g;

	var Fragment = function ( chars ) {
	/* ( Str ) -> {}
	* 
	* A fragment of a sentence. Returns an object that can
	* be assessed to determine how long to display it.
	*/
		var frag = {};

        // ========= (for external use) ========= \\
		frag.chars = chars;

		// Center value for alignment
		frag.index 	= 0;  // Is this necessary now? What does it do?
		frag.length = 0;

		// To be added to options at some point
    	// !!! Not properly implemented yet. Do not change lengths.
    	// Also, very crazy to implement changing of lengths.
		frag.shortLength = 4;
		frag.longLength  = 13;

		// Fragment Status Values
		frag.isNumeric 			= false;
		frag.hasLeadingQuote 	= false;
		frag.hasTrailingQuote 	= false;
		frag.hasPeriod 			= false;
		frag.hasOtherPunc 		= false;
		// frag.isShort 			= false;
		// frag.isLong 			= false;


        // ========= RUNTIME UPDATE (external) ========= \\
        frag.isShort = function () {
        	return frag.length <= frag.shortLength;
        };  // End frag.isShort()


        frag.isLong = function () {
        	return frag.length >= frag.longLength;
        };  // End frag.isLong()



        // ========= BUILD THE FRAGMENT (internal) ========= \\
		frag._process = function ( chars ) {
		/* ( Str ) -> this Fragment
		* 
		* Assigns properties to the fragment object based on
		* the characters it contains.
		*/
			frag.isNumeric = /\d/.test(chars);

			frag._setPuncProps( chars );
			frag._setLengthProps( chars );
			
			return frag;
		};  // End frag._process()


		frag._setLengthProps = function ( chars, hasLeading ) {
		/* ( Str ) -> this Fragment
		* 
		* Tests and sets the properties based on fragment length
		* ??: Punctuation, etc, are not counted in length?
		* 
		* TODO: ??: Allow (runtime) customization of word lengths?
		*/
			var match 	= chars.match(wordRegex);
			frag.length = (match) ? match.length : 0;

			// // If we find index is no longer of use:
			// var length  = frag.length;
			// if ( length <= frag.shortLength ) { frag.isShort = true; }
			// else if ( length >= frag.longLength ) { frag.isLong = true; }

			// Determine length and index settings
			switch (frag.length) {
				case 0:
				case 1:
					frag.index = 0;
					// frag.isShort = true;
					break;
				case 2:
				case 3:
				case 4:
					frag.index = 1;
					// frag.isShort = true;
					break;
				case 5:
				case 6:
				case 7:
				case 8:
					frag.index = 2;
					break;
				case 9:
				case 10:
				case 11:
				case 12:
				case 13:
					frag.index = 3;
					// frag.isLong = true;
					break;
				default:
					frag.index = 4;
					// frag.isLong = true;
					break;
			}  // end based on length

			// Adjust index for leading quote
			if (frag.hasLeadingQuote) {
				frag.index++;
			}

			return frag;
		};  // end frag._setLengthProps()


		frag._setPuncProps = function ( chars ) {
		/* ( Str ) -> this Fragment
		* 
		* Tests and sets the punctuation properties
		*/
			var lastChar 	= chars.substr(-1);
			var firstChar 	= chars[0];

			// Quotes or parenthesis
			// ??: These aren't currently used. Plans for future use?
			frag.hasLeadingQuote 	= /["'(”’]/.test(firstChar);
			frag.hasTrailingQuote 	= /["')”’]/.test(lastChar);

			// If there are "quotes" at the end, test the character before the "quotes"
			if (frag.hasTrailingQuote) { lastChar = chars.substr(-2,1); }

			frag.hasPeriod 		= /[.!?]/.test(lastChar);
			// ??: "Trailing quote" isn't considered other punctuation?
			frag.hasOtherPunc 	= frag.hasLeadingQuote || /[:;,_]/.test(lastChar);

			return frag;
		};  // end frag._setPuncProps()


        // ========= MAKE IT ========= \\
		frag._process( chars )
		return frag;
	};  // End Fragment() -> {}

    return Fragment;
}));
