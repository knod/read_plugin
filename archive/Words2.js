/* Words.js
* 
* Breaking up the text into sentences and words
* (currently word fragments, actually, but that will
* be phased out)
* 
* Based on https://github.com/jamestomasino/read_plugin/blob/master/ReadBlock.js
* 
* TODO:
* - ??: Should be called Sentences instead? A bit long :/
* 
* DONE:
* - Split Queue into
*   Words and...
*   Word(s) Navigator/Trotter/Transporter/Traveler/Traverse/Walker/Explorer
*/

(function (root, wordsFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {  // amd if possible
        // AMD. Register as an anonymous module.
        define( [], function () { return (root.Words = wordsFactory() ); });
    } else if (typeof module === 'object' && module.exports) {  // Node-ish next
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = wordsFactory();
    } else {  // Global if nothing else
        // Browser globals
        root.Words = wordsFactory();
    }
}(this, function () {

    "use strict";


    var Words = function () {
    /* ( None ) -> Words()
    * 
    * Will turn arrays of arrays of words into an object containing
    * the same /plus/ an array of positions of those arrays and words -
    * The positions of words and their place in each sentence.
    */
        var wrds = {};

        // ========= (for external use) ========= \\
        wrds.sentences = [];  // TODO: Change to .sentences
        // Since data will be in arrays of sentences with words, this will
        // tell us which index corresponds to which sentence/word position
        wrds.positions = [];


        // ========= BUILD THE QUEUE (internal) ========= \\
        wrds.process = function ( sentences ) {
        /* ( [[Str]] ) -> Words
        * 
        * Accepts array of array of strings (which should represent
        * words in sentences). Returnsan object containing the same
        * /plus/ an array of positions of those arrays and words -
        * The positions of words and their place in each sentence.
        */
            var wordObjs   	= wrds.sentences = sentences;  
            var positions   = wrds.positions = [];

            for ( let senti = 0; senti < sentences.length; senti++ ) {
                
                let sentence  = sentences[senti];
                for (let wordi = 0; wordi < sentence.length; wordi++) {
                    positions.push([ senti, wordi ]);
                };
            }

            return wrds;
        };  // End wrds.process()


        return wrds;
    };  // End Words() -> {}

    return Words;
}));

