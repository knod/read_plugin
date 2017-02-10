/* WordSplitter.js
* 
* Based on https://github.com/jamestomasino/read_plugin/blob/master/ReadBlock.js
* 
* Split a word into fragments based on... its length?
*/

(function (root, splitFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( [], function () { return ( root.WordSplitter = splitFactory() ); });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = splitFactory();
    } else {
        // Browser globals
        root.WordSplitter = splitFactory();
    }
}(this, function () {

	"use strict";


	var defaultSettings = {
		maxLength: 10
	};


	var WordSplitter = function ( prefSuf, storage ) {
	/* ( {}, {} ) -> {}
	*/
		var rSpt = {};

		// For testing
		storage.set('maxNumCharacters', 4);

		// // prefSuf should be based on language
	 //    var prefixes 	 = prefSuf.prefixes.join('|'),
	 //    	sufixes 	 = prefSuf.suffixes.join('|')
	 //    	preSufStr 	 = '^(\W*)(' + prefixes + ')?(.*?)(' + suffixes + ')?(\W*)$',
		// 	prefSufRegex = new Regexp( preSufStr, 'i' );

	 //    var vowelChars = 'aeiouyAEIOUY'+
	 //        'ẚÁáÀàĂăẮắẰằẴẵẲẳÂâẤấẦầẪẫẨẩǍǎÅåǺǻÄäǞǟÃãȦȧǠǡĄąĀāẢảȀȁȂȃẠạẶặẬậḀḁȺⱥ'+
	 //        'ǼǽǢǣÉƏƎǝéÈèĔĕÊêẾếỀềỄễỂểĚěËëẼẽĖėȨȩḜḝĘęĒēḖḗḔḕẺẻȄȅȆȇẸẹỆệḘḙḚḛɆɇɚɝÍíÌìĬĭÎîǏǐÏ'+
	 //        'ïḮḯĨĩİiĮįĪīỈỉȈȉȊȋỊịḬḭIıƗɨÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯȰȱØøǾǿǪǫǬǭŌōṒṓ'+
	 //        'ṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộƟɵÚúÙùŬŭÛûǓǔŮůÜüǗǘǛǜǙǚǕǖŰűŨũṸṹŲųŪūṺṻỦủȔȕȖȗƯưỨứỪừ'+
	 //        'ỮữỬửỰựỤụṲṳṶṷṴṵɄʉÝýỲỳŶŷY̊ẙŸÿỸỹẎẏȲȳỶỷỴỵʏɎɏƳƴ',
	 //    	consonants 	= '[^'+vowels+']',
	 //    	vowels 		= '['+vowels+']';
	 //    // Split words between consonants
	 //    var vccv = new RegExp('(' + vowels + consonants + ')(' + consonants + vowels + ')', 'g');

	    // var simple = new RegExp('(.{2,4}'+v+')'+'('+c+')', 'g');  // Currently not used


		rSpt.getMaxLength = function ( word, styles ) {

			// Get the max letters that can fit in the width
			var container 	= document.getElementByID('__rdly_text_button'),
				pxWidth		= styles['width'],
				fontSize 	= styles['font-size'];
			console.log(pxWidth, fontSize);
			var remWidth 	= Math.floor(pxWidth/fontSize);

			// Get the max letters that are allowed by the user
			var userMaxChars = storage.get('maxNumCharacters');  // Max # characters

			// Get the smaller of the two (the limiting factor)
			var maxChars 	 = Math.min( userMaxChars, remWidth );

			return maxChars;
		};  // End rSpt.getMaxLength()


		rSpt.makeCharsMap = function ( chars, maxWithHyphen ) {
		/* ( str, int ) -> [Int]
		* 
		* Return an array of how many groups of how many strings
		* the final word array should contain.
		*/
			var splitGroupLengths 	= [],
				evenly 				= Math.floor(chars.length/maxWithHyphen);

			// If we were to split the word evenly, how many letters would
			// go in each group? How many groups would there be? (not counting the remainder)
			for (let numi = 0; numi < evenly; numi++) {
				splitGroupLengths.push( maxWithHyphen );
			};

			// Find how much would remain after dividing the string evenly
			// If there's an imbalance, redistribute a bit
			var remainder = chars.length % maxWithHyphen,
				// How many letters are missing
				needed 	  = maxWithHyphen - remainder,
				// We'll add some back in by taking away letters from others
				halved 	  = Math.floor(needed/2),
				// `havled` removes characters counts from other items
				// Have to remember to add them to the very end (the remainder)
				toAddBack = halved + remainder;

			// And add that back into the mix, distributed in a... sensical? way
			// Right now: letters are removed from the starting strings in
			// order to make up for the last string (really I'd rather take from
			// every other group, visiting all eventually, but this is just
			// proof of concept)
			// Do that before adding the last group so we don't mess with the last group amount
			var lastIndx = splitGroupLengths.length,  // TODO: double check that this works out
				indx 	 = 0;
			while ( halved > 0 ) {

				splitGroupLengths[indx] = splitGroupLengths[indx] - 1;

				indx 	= indx + 1;
				// Start from the beginning string again if more need to be distributed
				indx 	= indx % lastIndx;
				halved 	= halved - 1;
			}

			splitGroupLengths.push( toAddBack );

			return splitGroupLengths;
		};  // End rSpt.makeCharsMap()


		var splitWord = function ( chars, maxChars ) {
		/* ( str, int ) -> [ str ]
		* 
		* Returns `chars` as string split into, ideally, syllables,
		* but in actual fact, just into parts of aproximately a
		* certain length that each isn't longer than `maxChars`
		* 
		* Note: Hyphens are added and accounted for.
		*/
			var split = [];

			// If it doesn't need to be broken up at all, just return what we have in an array
			if ( chars.length <= maxChars ) { return [chars]; }

			// TODO: Allow custom inclusion of hyphens. If hyphens are excluded
			// suggest whitespace indicators instead.
			// ??: If maxChars < 4, suggest space indicators instead of hypens?

			// Remember we're adding a dash to break up words
			var maxWithHyphen = maxChars - 1,
				maybeHyphen   = '-';
			// No dash for less than 4 characters
			if ( maxChars < 4 ) {
				maxWithHyphen 	= maxChars;
				maybeHyphen 	= '';
			}

			var splitMap = rSpt.makeCharsMap( chars, maxWithHyphen );

			// Build the list of strings with the right number of letters
			var start = 0;
			for (let numi = 0; numi < splitMap.length; numi++) {
				let str = chars.slice( start, start + splitMap[numi] );

				// Make sure last string doesn't get a hyphen
				if (numi < splitMap.length - 1) {
					str = str + maybeHyphen
				}

				split.push(str);
				// Start the next one where we finished this one
				start = start + splitMap[numi];
			};

			console.log(split)

			return split;
		};  // End rSpt.fragment()


		// rSpt.splitWord = function( chars, maxChars ) {  // Recursive?
		// 	// ??: Only use prefixes and suffixes of the right length?
		// 	// TODO: Add hyphen if chars is split and maxChars > 3

		// 	var split = [];

		// 	if ( chars.length <= maxChars ) { return [chars]; }

		// 	// A contingency just for maxChars of length 1, which is very easy to split
		// 	// Maybe one for just 2 chars long? For 3?
		// 	if ( maxChars < 4 ) {
		// 		// var str = '(.{' + maxChars '})'
		// 		// var regex = new Regexp( str, 'g' );
		// 		var regex = new RegExp(/(..)/, "g");
		// 		var test = regex.exec( chars );
		// 		console.log(test);

		// 		// This is until I find the right regex
		// 		var length  = chars.length;
		// 		var indx 	= 0;
		// 		while ( indx < chars.length ) {
		// 			// Get the next bit
		// 			var end = indx + maxChars;
		// 			var normalizedEnd = Math.min( chars.length, end );
		// 			console.log(indx, normalizedEnd, chars.slice(indx, normalizedEnd));
		// 			split.push( chars.slice(indx, normalizedEnd) );
		// 			indx += maxChars;
		// 		}

		// 		return split;
		// 	}

		// 	// Otherwise the chars has to be split. Make sure to add hyphens
		// 	// if the word isn't too short (TODO: ??: length till hyphen customizable??)
		// 	var maxWithHyphen = maxChars,
		// 		maybeHyphen   = '';
		// 	if ( maxChars > 3 ) {
		// 		maxWithHyphen 	= maxChars - 1;
		// 		maybeHyphen 	= '-';
		// 	}

  //           // punctuation, prefix, center, suffix, punctuation
  //           var parts = presuf.exec( chars ),
  //           	toSplitHarsh = parts[3];

  //           // If nothing else is splitting, we'll have to force a split
  //           if ( toSplitHarsh && toSplitHarsh > maxWithHyphen ) {
  //           	// How to insert something into the right position in an array?
  //           	var harshed = vccv.exec( toSplitHarsh );
  //           	// Maybe this isn't English or is some kind of nonsense word
  //           	// If so, split it in half instead
  //           	if ( harshed === null ) {
  //           		harshed 	= [];
  //           		var half 	= Math.floor(toSplitHarsh.length/2);
  //          			harshed[0] 	= toSplitHarsh;
  //          			// Exclusive at the end
  //          			harshed[1]  = toSplitHarsh.slice(0, half);
  //          			harshed[2] 	= toSplitHarsh.slice(half, toSplitHarsh.length);
  //           	}

  //           	parts[6] = parts[5];
  //           	parts[5] = parts[4];
  //           	parts[4] = harshed[2];
  //           	parts[3] = harshed[1];
  //           }


  //           for (let parti = 0; parti < parts.length; parti++) {
  //           	let part = parts[parti];
  //           	if ( part !== null && part.length !== 0 ) {
  //           		// If it's already short enough, add it to the list
  //           		if ( part.length <= maxWithHyphen ) {
  //           			part = part + '-';
  //           			split.push( part );

  //           		// If it's too long, split it some more
  //           		} else {
  //           			var moreParts = rSpt.splitWord( part, maxChars );
  //           			// split.concat( moreParts );  // Does this return a new thing? How to just mutate the array?
  //           			for (var mPartsi = 0; mPartsi < moreParts.length; mPartsi++) {
  //           				split.push( moreParts[mPartsi] );
  //           			};
  //           		}
  //           	}
  //           };


  //           if (parts[2]) {
  //               ret.push(parts[2]);
  //           }
  //           if (parts[3]) {
  //               ret.push(parts[3].replace(vccv, '$1-$2'));
  //           }
  //           if (parts[4]) {
  //               ret.push(parts[4]);
  //           }
  //           return (parts[1]||'') + ret.join('-') + (parts[5]||'');


		// 	return split;
		// }  // End rSpt.rSpt.splitWord()



		rSpt.process = function( chars ) {

			var styles 		= container.getComputedStyles(),
				maxLength 	= rSpt.getMaxLength( word, styles );

			var split 		= rSpt.splitWord( word, maxChars );

			return split;
		};  // End rSpt.process()



		return rSpt;
	};  // End WordSplitter() -> {}

    return WordSplitter;
}));
