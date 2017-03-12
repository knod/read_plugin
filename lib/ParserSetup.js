/* ParserSetup.js
* 
* Sets up options/functions for parser
*/


(function (root, setupFactory) {  // root is usually `window`
    if ( typeof define === 'function' && define.amd) {  // amd if possible
        // AMD. Register as an anonymous module.
        define( ['jquery', 'franc', 'iso-639.json', '@knod/unfluff', '@knod/sbd'], function (jQuery, franc, langCodes, unfluff, sbd) { return (root.Parser = setupFactory(jQuery, franc, langCodes, unfluff, sbd) ); });
    } else if ( typeof module === 'object' && module.exports) {  // Node-ish next
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = setupFactory( require('jquery'), require('franc'), require('./parse/iso-639.json'), require('@knod/unfluff'), require('@knod/sbd') );
    } else {  // Global if nothing else
        // Browser globals
        console.warn('If this isn\'t running off browserify, I\'m not sure how to get these libs in here.')
        // root.Parser = setupFactory( JQuery );
    }
}( this, function ( $, franc, langCodes, unfluff, sbd ) {
	/* (jQuery, {}, {}, {}, {}) -> Parser Setup Constructor */

    "use strict";


    var ParserSetup = function () {
    /* () -> ParserSetup
    * 
    * Builds the options needed for the parser
    */
    	var rSup = {};

    	rSup.debug = false;

    	rSup.cleanNode = function ( node ) {
    	/* ( DOM Node ) -> same DOM Node
    	* 
    	* Removes unwanted elements from the node and returns it.
        * TODO: Add 'head' (not 'iframe', though)
	    */
    		var $node     = $(node),
                // 'sup' has been declared distracting
                // 'script' and 'style' have English, skewing language detection results
                toRemove  = ['sup', 'script', 'style', 'head'];

            for (let tagi = 0; tagi < toRemove.length; tagi++) {
                let tag = toRemove[tagi];
                $node.find(tag).remove();
            };

    		return $node[0];
    	};


    	rSup.detectLanguage = function ( text ) {
    	/* ( Str ) -> iso6391 language code Str
    	* 
    	* Best guess. Defaults to English if none other is found.
    	*/
    		var lang = franc( text,
    			// The languages unfluff can handle atm
    				{ 'whitelist': ['ara', 'bul', 'ces', 'dan', 'deu', 'ell',
    					'eng', 'spa', 'fin', 'fra', 'hun', 'ind', 'ita', 'kor',
    					'nob', 'nor', 'pol', 'por', 'rus', 'swe', 'tha', 'tur', 'zho']
    			});
    		if (lang === 'und') {lang = 'eng';}

    		var iso6391Lang = langCodes[lang].iso6391;

    		if (rSup.debug) {  // Help non-coder devs identify some bugs
        	    console.log( '~~~parse debug~~~ language detected:', lang, '->', iso6391Lang );
    		}

    		return iso6391Lang;
    	};  // End rSup.detectLanguage()


    	rSup.findArticle = function ( node, lang ) {
    	/* ( DOM Node, Str ) -> Str
    	* 
    	* Uses the language `lang` and a DOM Node to return
    	* the best guess at the main text of the article
	    */
	    	var html = $(node).html(),
				cmds = unfluff.lazy( html, lang ),
				text = cmds.text();

            // Last ditch effort to get something if unfluff doesn't
            // get anything
            if (!text) { text = $(node).text(); }

    		if (rSup.debug) {  // Help non-coder devs identify some bugs
        	    console.log( '~~~parse debug~~~ article text identified (a string):', text );
    		}

			return text;
    	};  // End rSup.findArticle()


    	rSup.cleanText = function ( text ) {
    	/* (Str) -> Str
    	* 
    	* Does whatever further text filtering, cleaning, and parsing needs
    	* to be done. Default does nothing
    	*/
    		var cleaned = text;

    		// Add your code here
    		if (rSup.debug) {  // Help non-coder devs identify some bugs
        	    console.log( '~~~parse debug~~~ plain text cleaned (a string):', cleaned );
    		}

    		return cleaned;
    	};  // End rSup.cleanText()


    	rSup.splitSentences = function ( text ) {
    	/* ( Str ) -> [[Str]
    	* 
    	* Returns a list of sentences, which are each a list of words (strings).
        * Best results with English.
	    */
            var sentences = sbd.sentences( text, {parse_type: 'words'} );

    		if (rSup.debug) {  // Help non-coder devs identify some bugs
        	    console.log( '~~~parse debug~~~ sentences (an array of arrays of strings):', sentences );
    		}

            return sentences;
    	};

		return rSup;
    };  // End ParserSetup() -> {}

    return ParserSetup;
}));
