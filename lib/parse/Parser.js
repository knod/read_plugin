/* Parser.js
* 
* Make your own parser if you want, as long as
* its .parse() returns a list of lists of strings.
* (list of sentences which are lists of words)
*/

(function (root, parserFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {  // amd if possible
        // AMD. Register as an anonymous module.
        define( ['jquery'], function (jquery) { return (root.Parser = parserFactory(jquery) ); });
    } else if (typeof module === 'object' && module.exports) {  // Node-ish next
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = parserFactory( require('jquery') );
    } else {  // Global if nothing else
        // Browser globals
        root.Parser = parserFactory( jQuery );
    }
}(this, function ($) {
	/* (jQuery) -> Parser Constructor */

    "use strict";


    var Parser = function ( cleanNode, detectLanguage, findArticle, cleanText, splitSentences ) {
    /* (func, func, func, func) -> Parser
    * 
    * Given a set of functions, returns an object that can use those modules to
    * extract text as a list of sentences. If all that's being passed in is
    * text (not a DOM node), the only required modules are 'cleanText' and `splitSentences`.
    *
    * - 'cleanNode' accepts a DOM node and removes unwanted elements
    * - `detectLanguage` accepts a string of text and returns the code
    * for the detected language
    * - `findArticle` uses that language and a DOM Node containing text
    * to return the main text of the article
    * - `cleanText` accepts a string and does something (or nothing) to
    * it, then returns the changed (or same) string
    * - `splitSentences` accepts text (best with English) and returns a
    * list of sentences containing lists of words
    */
    	var rPar = {};

    	rPar.language = 'en';


		rPar.cleanHTML = function ( $node ) {
		// Remove unwanted nodes from the text
			$node.find('sup').remove();
			// These would have English, so they'd skew language detection results
			$node.find('script').remove();
			$node.find('style').remove();
			return $node;
		};


		rPar.smallSample = function ( node, desiredSampleLength ) {
		/* ( jQuery Node, [int] ) -> Str
		* 
		* Get a sample of the text (probably to use in detecting language)
		* A hack for language detection for now until language detection
		* is made lazy.
		*/
			var $node 				= $(node),
				halfSampleLength 	= desiredSampleLength/2 || 500;


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
		};  // End rPar.smallSample()


		rPar.parse = function ( input ) {
	    /* ( DOM Node || Str ) -> [Str]
	    * 
	    * Given an DOM node or string of text, returns a list of sentences.
	    * What it returns depends heavily on
	    */
	    	var rawText = '';

	    	if ( typeof input === 'string' ) {

	    		rawText = input;

	    	// Otherwise it's a DOM node
	    	} else {
	    		var $node = $(input);

		    	var clone = $node.clone()[0],
		    		clean = cleanNode( clone );

		    	var sampleText 	= rPar.smallSample( clean ),
		    		lang 		= detectLanguage( sampleText );
		    	rPar.language 	= lang;

		    	rawText = findArticle( clean, lang );
	    	}

	    	var refinedText = cleanText( rawText ),
	    		sentences = splitSentences( rawText );

	    	return sentences;
		};  // End rPar.parse()

		return rPar;
    };  // End Parser() -> {}

    return Parser;
}));
