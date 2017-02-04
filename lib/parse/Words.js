/* Words.js
* 
* Breaking up the text into sentences and words
* (currently word fragments, actually, but that will
* be phased out)
* 
* Based on https://github.com/jamestomasino/read_plugin/blob/master/ReadBlock.js
* 
* TODO:
* - Split Queue into
*   Words and...
*   Word(s) Navigator/Trotter/Transporter/Traveler/Traverse/Walker/Explorer
* - ??: Should be called Sentences instead? A bit long :/
*/

(function (root, wordsFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {  // amd if possible
        // AMD. Register as an anonymous module.
        define( ['lib/Fragment', 'nlp_compromise'], function (Fragment, npl) { return (root.Words = wordsFactory(Fragment, npl) ); });
    } else if (typeof module === 'object' && module.exports) {  // Node-ish next
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = wordsFactory( require('../Fragment.js'), require('nlp_compromise') );
    } else {  // Global if nothing else
        // Browser globals
        root.Words = wordsFactory( Fragment, root );  // root.sentences is undefined :P Not sure what to provide there
    }
}(this, function ( Fragment, sentenceParser ) {

    "use strict";

    var wordRegex = /([^\s\-\—\/]+[\-\—\/]?|[\r\n]+)/g;
    var presuf = /^(\W*)(anti|auto|ab|an|ax|al|as|bi|bet|be|contra|cat|cath|cir|cum|cog|col|com|con|cor|could|co|desk|de|dis|did|dif|di|eas|every|ever|extra|ex|end|en|em|epi|evi|func|fund|fin|hyst|hy|han|il|in|im|ir|just|jus|loc|lig|lit|li|mech|manu|man|mal|mis|mid|mono|multi|mem|micro|non|nano|ob|oc|of|opt|op|over|para|per|post|pre|peo|pro|retro|rea|re|rhy|should|some|semi|sen|sol|sub|suc|suf|super|sup|sur|sus|syn|sym|syl|tech|trans|tri|typo|type|uni|un|van|vert|with|would|won)?(.*?)(weens?|widths?|icals?|ables?|ings?|tions?|ions?|ies|isms?|ists?|ful|ness|ments?|ly|ify|ize|ise|ity|en|ers?|ences?|tures?|ples?|als?|phy|puts?|phies|ry|ries|cy|cies|mums?|ous|cents?)?(\W*)$/i;
    var vowels = 'aeiouyAEIOUY'+
        'ẚÁáÀàĂăẮắẰằẴẵẲẳÂâẤấẦầẪẫẨẩǍǎÅåǺǻÄäǞǟÃãȦȧǠǡĄąĀāẢảȀȁȂȃẠạẶặẬậḀḁȺⱥ'+
        'ǼǽǢǣÉƏƎǝéÈèĔĕÊêẾếỀềỄễỂểĚěËëẼẽĖėȨȩḜḝĘęĒēḖḗḔḕẺẻȄȅȆȇẸẹỆệḘḙḚḛɆɇɚɝÍíÌìĬĭÎîǏǐÏ'+
        'ïḮḯĨĩİiĮįĪīỈỉȈȉȊȋỊịḬḭIıƗɨÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯȰȱØøǾǿǪǫǬǭŌōṒṓ'+
        'ṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộƟɵÚúÙùŬŭÛûǓǔŮůÜüǗǘǛǜǙǚǕǖŰűŨũṸṹŲųŪūṺṻỦủȔȕȖȗƯưỨứỪừ'+
        'ỮữỬửỰựỤụṲṳṶṷṴṵɄʉÝýỲỳŶŷY̊ẙŸÿỸỹẎẏȲȳỶỷỴỵʏɎɏƳƴ';
    var c = '[^'+vowels+']';
    var v = '['+vowels+']';
    var vccv = new RegExp('('+v+c+')('+c+v+')', 'g');
    var simple = new RegExp('(.{2,4}'+v+')'+'('+c+')', 'g');  // Currently not used
    var puncSplit = /(.+?)(\.[^\w]\b|,[^\w]\b)(.+?)/;


    // TODO: Do this without needing a new object each time
    var Words = function () {
    /* 
    * 
    * 
    */
        var wrds = {};

        // ========= (for external use) ========= \\
        wrds.text      = null;  // Is this useful?
        wrds.sentenceFragments = [];  // TODO: Change to .sentences
        // Since data will be in arrays of sentences with words, this will
        // tell us which index corresponds to which sentence/word position
        wrds.positions = [];


        // ========= BUILD THE QUEUE (internal) ========= \\
        wrds.process = function ( sentences ) {
        // No automatic `._init()` this time. ??: Convert all to this format?

 			// Array of arrays of fragment objects (just words later)
            var sFrags   	= wrds.sentenceFragments = [];  
            wrds.positions 	= [];

            for ( let senti = 0; senti < sentences.length; senti++ ) {
                let sentence     = sentences[senti],
                    fragmented   = wrds._processSentence( sentence, senti );
                sFrags.push( fragmented );
            }

            return wrds;
        };  // End wrds.process()

        wrds._processSentence = function ( text, sentenceIndex ) {

            var sentence    = [],
                positions   = wrds.positions;

            // Build word chain
            var rawWords    = text.match(wordRegex),
                fragIndex   = 0;
            var pos         = positions.length;  // 1 past the previous index

            // Extra splits on odd punctuation situations
            let i = 0;
            while (i < rawWords.length) {
                let w 		 = rawWords[i];
                w 			 = wrds._puncBreak(w);
                let subWords = w.match(wordRegex);
                let j = 0;
                while (j < subWords.length) {
                    if (subWords[j].length > 13) {
                        let subw 		= wrds._break(subWords[j]);
                        let subsubWords = subw.match(wordRegex);
                        let k = 0;
                        while (k < subsubWords.length) {
                            let frag = new Fragment(subsubWords[k]);

                            sentence.push( frag );
                            positions.push( [ sentenceIndex, fragIndex ] );
                            // positions.push( { sentence: sentenceIndex, fragment: fragIndex } );
                            fragIndex++;
                            
                            k++;
                        }  // end for every sub sub word

                    } else {
                        let frag = new Fragment(subWords[j]);
                        sentence.push( frag );
                        positions.push( [ sentenceIndex, fragIndex ] );
                        // positions.push( { sentence: sentenceIndex, fragment: fragIndex } );

                       fragIndex++;
                    }  // end if long word

                    j++;
                }  // end for every subword

                i++;
            }  // end for every raw word

            // TODO: Change this format
            return sentence;
        };  // End wrds._processSentence()

        wrds._puncBreak = function (word) {  // Recursive
            var parts = puncSplit.exec(word);
            var ret = [];
            if (parts) {
                ret.push (parts[1]+parts[2]);
                ret = ret.concat(wrds._puncBreak(parts[3]));
            } else {
                ret = [word];
            }
            return ret.join(' ');
        };

        wrds._break = function (word) {
        /* ( str ) -> other Str
        * 
        * Break up longer words into shorter fragments.
        * TODO: Deal with words that are non-English or nonsense
        */
            // punctuation, prefix, center, suffix, punctuation
            var parts = presuf.exec(word);
            var ret   = [];
            if (parts[2]) {
                ret.push(parts[2]);
            }
            if (parts[3]) {
                ret.push(parts[3].replace(vccv, '$1-$2'));
            }
            if (parts[4]) {
                ret.push(parts[4]);
            }
            return (parts[1]||'') + ret.join('-') + (parts[5]||'');
        };

        return wrds;
    };  // End Words() -> {}

    return Words;
}));

