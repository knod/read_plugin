/* WordNav.js
* 
* Navigate the sentences and words in Words
* 
* Based on https://github.com/jamestomasino/read_plugin/blob/master/ReadBlock.js
* 
* TODO:
* - Go back a sentence - array of indexes where sentences start?
* - Change max word length - recombine split words (record of which
* words were split) and address each word that is longer than
* the max-word length.
* - ??: Add delay for paragraph?
* - Reset values non-destructively
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
    * Always use .getFragment
    */
        var wNav = {};

        // Contains .text, .sentenceFragments, .positions
        wNav.words = null;

        wNav.index 		 = 0;
        wNav.position    = [0, 0, 0],
        wNav.currentWord = null;
        wNav.fragmentor  = null;

        // ==== Internal ==== \\
        wNav._progress 	= 0;
        var sentences 	= null,
        	positions 	= null;


       	wNav.process = function ( words, fragmentor ) {
       		if (!words) { console.error('WordNav needs dataz to .process(). You gave it dis:', words); }

	        wNav.words 	= words;
	        sentences 	= words.sentenceFragments;
	    	positions 	= words.positions;

            wNav.fragmentor = fragmentor;

	       return wNav;
       	};

        // ========= RUNTIME: TRAVELING THE WORDS/SENTENCES (for external use) ========= \\

        wNav.restart = function () {
            // Will be normalized by the next operation called (next, prev, current)
            wNav.index    = 0;
            wNav.position = [0, 0, 0];
            return wNav;
        };


        // wNav.getFragment = function ( changesOrIndex ) {
        // // ( [int, int] or int ) -> Fragment
        //     wNav.index       = wNav._step( changesOrIndex );
        //     wNav.position    = positions[ wNav.index ];
        //     return sentences[ wNav.position[0] ][ wNav.position[1] ];
        // }  // End wNav.getFragment()



        wNav.currentWord = null;
        wNav.getFragment = function ( changesOrIndex ) {
        /* ( [int, int, int] or int ) -> Fragment
        * 
        * Currently it seems that only one of the ints can
        * be something other than 0.
        * ??: Are there cases where that isn't true?
        */

            // wNav.index       = wNav._step( changesOrIndex );
            // wNav.position    = positions[ wNav.index ];
            // wNav.position[2] = ??;
            // wNav.currentWord = sentences[ wNav.position[0] ][ wNav.position[1] ];

            // var index = wNav._step( changesOrIndex );



            // Need:
            // overall index to get current word
            // index in word fragments of current word
            // Need fragment index in order to get overall index...


            // --------------------------------

            // Pseudo
            // If maxNumCharacters changed, re-fragment word and start at
            // the beginning of word

            // !!! CAN ONLY CHANGE ONE INDEX AT A TIME !!! \\
            // if plain index change
                // get new word( index )
            // if fragment change
                // if current fragment starts new word
                    // index += 1
                    // ***get new word( index )
                // If current fragment possible
                    // don't change index
                    // change fragi/position[2]
            // if word change
                // index += change
                // ***get new word( index )
            // if sentence change
                // get new sentence (all that stuff)
                // get new index
                // ***get new word( index )

            // return currentWord[ position[2] ]


            // ***get new word( index )
                // normalize given index
                // change actual index
                // position[2] = 0 (fragi = 0)
                // get new fragments

            // --------------------------------
            // Pseudo
            // If maxNumCharacters changed, re-fragment word and start at
            // the beginning of word

            // if fragment change
                // if current fragment starts new word
                    // index += 1
                    // ***get new word( index )
                // If current fragment possible
                    // don't change index
                    // change fragi/position
                    // get current fragment
            // if word change
                // index += change
                // ***get new word( index )
            // if sentence change
                // get new sentence (all that stuff)
                // get new index
                // ***get new word( index )


            // ***get new word( index )
                // normalize given index
                // change actual index
                // ***get new word as fragments


            var frag = null;
            var pos         = wNav.position,
                // wNav.currentWord isn't just a string. It's not from the sentence/word
                // array, it's a word once it has been fragmented into a list of strings
                currentWord = wNav.currentWord;

            // TODO:
            // If maxNumCharacters changed, re-fragment word and start at
            // the beginning of word

            // if plain index change/jump
            if ( typeof changesOrIndex === 'number' ) {
                currentWord = wNav._stepWord( changesOrIndex );
                pos[2]      = 0;

            // !!! CAN ONLY CHANGE ONE POSITION AT A TIME !!! \\

            // if sentence change
            } else if ( changesOrIndex[0] !== 0 ) {

                // find new sentence and get the new index
                var index   = wNav._stepSentence( changesOrIndex[0] );
                currentWord = wNav._stepWord( index );
                pos[2]      = 0;

            // if word change
            } else if ( changesOrIndex[1] !== 0 ) {

                index       += changesOrIndex[1];
                currentWord = wNav._stepWord( index );
                pos[2]      = 0;

            // if fragment change
            } else if ( changesOrIndex[2] > 0 ) {  // No provision for backwards fragment travel

                var fragi = pos[2] + changesOrIndex[2];

                // if current fragment starts new word
                if ( fragi >= currentWord.length ) {
                    
                    currentWord = wNav._stepWord( wNav.index + 1 );
                    pos[2]      = 0;
                
                } else {

                    // don't change index or current word, just current fragment position
                    pos[2] = fragi;

                }

            }  // end if index or which position changed


            wNav.currentWord = currentWord;
            frag             = currentWord[ pos[2] ];

            return frag;
        }  // End wNav.getFragment()





        wNav._stepWord = function ( index ) {
            wNav.index      = wNav.normalizeIndex( index );
            wNav.position   = positions[ wNav.index ];
            // wNav.position[2] = ??;
            // wNav.currentWord = sentences[ wNav.position[0] ][ wNav.position[1] ];
            var word        = sentences[ wNav.position[0] ][ wNav.position[1] ],
                fragmented  = wNav.fragmentor.fragment( word );

            return fragmented;
        };  // End wNav._stepWord()



        // wNav._step = function ( changesOrIndex ) {
        // // ( [int, int] or int ) -> #
        //     var index = wNav.index;

        //     if ( typeof changesOrIndex === 'number' ) {
        //         index = wNav.normalizeIndex( changesOrIndex );
        //     } else {
        //         // If there's a sentence level change, we're traveling
        //         // sentences, not words (this assumes we never do both)
        //         if ( changesOrIndex[0] !== 0 ) {
        //             index = wNav._stepSentence( changesOrIndex[0] );
        //         } else if ( changesOrIndex[1] !== 0 ) {
        //             index += changesOrIndex[1];
        //             index = wNav.normalizeIndex( index );
        //         }
        //     }  // end if index or change array
        //     return index;
        // };  // end wNav._step();


        // wNav._getChange = function ( changeAttempt ) {
        // // ( [#, #, #] or # ) -> [#, #, #]

        // };  // End wNav._getChange()


        wNav._step = function ( changesOrIndex ) {
        // ( [#, #, #] ) -> ?
        // ??: Changes index if needed?
            var index = wNav.index;

            if ( typeof changesOrIndex === 'number' ) {
                index = wNav.normalizeIndex( changesOrIndex );
            } else {
                // If there's a sentence level change, we're traveling
                // sentences, not words (this assumes we never do both)
                if ( changesOrIndex[0] !== 0 ) {
                    index = wNav._stepSentence( changesOrIndex[0] );
                } else if ( changesOrIndex[1] !== 0 ) {
                    index += changesOrIndex[1];
                    index = wNav.normalizeIndex( index );
                } else {
                    // Word fragment change is only ever positive?
                    // That's what's assumed here
                    if ( changesOrIndex[2] > wNav.currentWord.length ) {
                        index += 1;
                    }
                }
            }  // end if index or change array

            wNav.index = index;

            return index;
        };  // end wNav._step()


        wNav._stepFragment = function ( fragChange ) {

            // If the change goes past the end of the word,
            // go on to the next word instead

            // Otherwise, get the next fragment


        };  // End wNav._stepFragment()


        wNav._stepWord = function ( wordChange ) {
            var index += wordChange;
            index = wNav.normalizeIndex( index );
            return index;
        }  // end wNav._stepWord()


        wNav._stepSentence = function ( sentenceChange ) {
        // ( [int, int] ) -> int
            if ( sentenceChange === 0 ) {return};

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
        /* ( int, [int, int] ) -> int or null
        * 
        * Given the direction of change and the position desired, find the
        * index of the new position.
        * Only used for sentence changes. If we need something else,
        * we'll see about that then. Just trying to speed up the search
        */
            if ( sentenceChange === 0 ) {return null;}  // signOf shouldn't return NaN now

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
        /* ( [int, int] ) -> int
        * 
        * Given a [sentence, word] position, find the index of that
        * configuration in the positions list. If none found, return
        * -1. (There are ways to speed this up if needed, like checking
        * just sentence index first until sentence found, etc).
        * 
        * This is different from ._sentenceChangeToIndex() because this
        * one searches the whole array, it doesn't start from the current
        * position and work in a direction (back of forward) from there.
        */
            var index = positions.findIndex( function matchPosToIndex( potential ) {
                var sent = (pos[0] === potential[0]),
                    frag = (pos[1] === potential[1]);
                return sent && frag
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

        wNav.getLength = function () {
            return positions.length;
        };

        wNav.getIndex = function () {
            return wNav.index;
        }

        return wNav;
    };  // End WordNav() -> {}

    return WordNav;
}));
