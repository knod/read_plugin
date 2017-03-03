/* WordNav.js
* 
* Navigate the sentences and words in Words
* 
* Based on https://github.com/jamestomasino/read_plugin/blob/master/ReadBlock.js
* 
* TODO:
* - ??: Add delay for paragraph?
* - Reset values non-destructively
* 
* DONE:
* - Go back a sentence - array of indexes where sentences start?
* - Change max word length - recombine split words (record of which
* words were split) and address each word that is longer than
* the max-word length.
* - Split Qeue into
*   Words and...
*   Word(s) Navigator/Trotter/Transporter/Traveler/Traverse/Walker/Explorer
*/

(function (root, wNavFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {  // amd if possible
        // AMD. Register as an anonymous module.
        define( [], function () { return ( root.WordNav = wNavFactory() ) });
    } else if (typeof module === 'object' && module.exports) {  // Node-ish next
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = wNavFactory();
    } else {  // Global if nothing else
        // Browser globals
        // !!! Broken !!!
        root.WordNav = wNavFactory( Fragment, root );  // root.sentences is undefined :P Not sure what to provide there
    }
}(this, function () {

    "use strict";


    // TODO: Do this without needing a new object each time
    var WordNav = function () {
    /* ( None ) -> WordNav
    * 
    * Provides commands for getting the words/fragments passed into
    * its `.process()`. 
    * Always use .getFragment()
    */
        var wNav = {};

        wNav.words = null;  // Contains .sentences, .positions

        wNav.index 		 = 0;
        wNav.position    = [0, 0, 0],
        wNav.currentWord = null;  // [ Str ]
        wNav.fragmentor  = null;


        // ==== Internal ==== \\
        wNav._progress 	= 0;
        var sentences 	= wNav._sentences = null;
        var positions 	= wNav._positions = [];


       	wNav.process = function ( senteceArray, fragmentor ) {
       		if (!senteceArray) { console.error('WordNav needs dataz to .process(). You gave it dis:', senteceArray); }

            wNav.fragmentor = fragmentor;

            sentences = wNav.sentences = senteceArray;  
            positions = wNav.positions = [];  // TODO: ??: Empty non-destructively??

            for ( let senti = 0; senti < sentences.length; senti++ ) {
                
                let sentence  = sentences[senti];
                for (let wordi = 0; wordi < sentence.length; wordi++) {
                    positions.push([ senti, wordi ]);
                };
            }

	       return wNav;
       	};



        // ========= RUNTIME: TRAVELING THE WORDS/SENTENCES (for external use) ========= \\

        wNav.restart = function () {
            wNav.index    = 0;
            wNav.position = [0, 0, 0];
            return wNav;
        };


        wNav.getFragment = function ( changesOrIndex ) {
        /* ( [int, int, int] or int ) -> Str
        * 
        * Currently it seems that only one of the ints can be something
        * other than 0.
        * ??: Find cases where that isn't true.
        */
            var frag        = null;
            var pos         = wNav.position,
            // wNav.currentWord isn't just a string. It's not from the sentence/word
            // array, it's a word once it has been fragmented into a list of strings
                rawWord = wNav.currentWord;

            // TODO:
            // If maxNumCharacters changed, re-fragment word and start at
            // the beginning of word

            // if plain index change/jump
            if ( typeof changesOrIndex === 'number' ) {
                rawWord = wNav._stepWord( changesOrIndex );
                pos[2]      = 0;

            // !!! CAN ONLY CHANGE ONE POSITION AT A TIME !!! \\

            // if sentence change
            } else if ( changesOrIndex[0] !== 0 ) {

                // find new sentence and get the new index
                var index   = wNav._stepSentence( changesOrIndex[0] );
                rawWord = wNav._stepWord( index );
                pos[2]      = 0;

            // if word change
            } else if ( changesOrIndex[1] !== 0 ) {

                index       = wNav.index + changesOrIndex[1];
                rawWord = wNav._stepWord( index );
                pos[2]      = 0;

            // if fragment change
            } else if ( changesOrIndex[2] > 0 ) {  // No provision for backwards fragment travel

                var fragi = pos[2] + changesOrIndex[2];

                // if current fragment starts new word
                if ( fragi >= rawWord.length ) {

                    rawWord = wNav._stepWord( wNav.index + 1 );
                    pos[2]      = 0;
                
                } else {

                    // don't change index or current word, just current fragment position
                    rawWord = wNav._stepWord( wNav.index );
                    pos[2] = fragi;

                }

            // If no change, get whatever's current
            } else {
                rawWord = wNav._stepWord( wNav.index );
                pos[2]      = 0;
            } // end if index or which position changed


            wNav.currentWord = wNav.fragmentor.process( rawWord );
            frag             = wNav.currentWord[ pos[2] ];

            return frag;
        }  // End wNav.getFragment()



        wNav._stepWord = function ( index ) {
        // ( int ) -> [ Str ]
            wNav.index      = wNav.normalizeIndex( index );
            var pos         = positions[ wNav.index ];
            wNav.position[0]= pos[0];
            wNav.position[1]= pos[1];
            var word        = sentences[ wNav.position[0] ][ wNav.position[1] ];

            return word;
        };  // End wNav._stepWord()



        wNav._stepSentence = function ( sentenceChange ) {
        // ( int ) -> Int
            if ( sentenceChange === 0 ) { return 0; }

            var pos     = [ wNav.position[0], wNav.position[1] ],
                senti   = pos[0],
                wordi   = pos[1];

            // If in the last sentence, go to the last word
            if ( sentenceChange > 0 && senti >= (sentences.length - 1) ) {
                wordi = sentences[ senti ].length - 1;

            } else {
                // If we're in the middle of a sentence and we're
                // only going back one step, go back to the beginning of the sentence
                if ( sentenceChange === -1 && wordi > 0 ) {}  // No change to sentence
                // otherwise change sentence
                else { senti += sentenceChange; }
                // Either way, word is first word of sentence
                wordi = 0;
            }  // end if at last sentence

            pos[1] = wordi;
            pos[0] = wNav.normalizeSentencePos( senti );

            var newIndex = wNav._sentenceChangeToIndex( sentenceChange, pos );
            if ( newIndex === null ) { newIndex = wNav.index; }

            return newIndex;
        };  // End wNav._stepSentence


        wNav._sentenceChangeToIndex = function ( sentenceChange, newPos ) {
        /* ( int ) -> Int or null
        * 
        * Given the direction of change and the position desired, find the
        * index of the new position.
        * Only used for sentence changes. If we need something else,
        * we'll see about that then. Just trying to speed up the search.
        */
            if ( sentenceChange === 0 ) { return 0; }  // signOf shouldn't return NaN now

            var incrementor = signOf( sentenceChange ),  // 1 or -1
                tempi       = wNav.index,
                found       = false;

            // Until we find the position or there are no more positions left
            while ( !found && positions[ tempi ] ) {
                // Test out positions
                var pos = positions[ tempi ];
                if ( pos[0] === newPos[0] && pos[1] === newPos[1] ) {
                    found = true;
                }
                // If not found, keep going until there are no more positions left in the list
                if (!found) { tempi += incrementor; }
            }

            // If we went through all the list we could and didn't find anything, say so
            // Not quite sure why that would happen, though
            if ( !positions[tempi] ) { tempi = null; }

            return tempi;
        };  // End wNav._sentenceChangeToIndex()


        wNav._positionToIndex = function ( pos ) {
        /* ( [int, int] ) -> Int
        * 
        * Given a [sentence, word] position, find the index of that
        * configuration in the positions list. If none found, return
        * -1. (There are ways to speed this up if needed, like checking
        * just sentence index first until sentence found, etc).
        * 
        * This is different from ._sentenceChangeToIndex() because this
        * one searches the whole array, it doesn't start from the current
        * position and work in a direction (back of forward) from there.
        * TODO: Performance analysis on long texts
        */
            var index = positions.findIndex( function matchPosToIndex( potential ) {
                var sent = (pos[0] === potential[0]),
                    frag = (pos[1] === potential[1]);
                return sent && frag;
            })
            return index;
        }



        // ========== utilities ========== \\

        var signOf = function ( num ) {
            return typeof num === 'number' ? num ? num < 0 ? -1 : 1 : num === num ? num : NaN : NaN;
        }

        wNav.normalizeIndex = function ( index ) {
            index = Math.min( index, positions.length - 1 );  // max
            return Math.max( index, 0 );  // min
        };
        wNav.normalizeSentencePos = function ( senti ) {
            senti = Math.min( senti, (sentences.length - 1) );
            return Math.max( senti, 0 );
        };



        // ========== gets ========== \\

        wNav.getProgress = function () {
            wNav._progress = wNav.index / (positions.length - 1);
            return wNav._progress;
        };
        wNav.getLength = function () { return positions.length; };
        wNav.getIndex = function () { return wNav.index; }


        return wNav;
    };  // End WordNav() -> {}

    return WordNav;
}));
