/* ReaderlyStorage.js
* 
* Destructive, unfortunately - doesn't mutate settings,
* just recreates them. All async :/
* 
* For now, chrome extension storage. Migrate in future.
* https://developer.chrome.com/extensions/storage
*/


(function (root, storeFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( [], function () {
        	return ( root.ReaderlyStorage = storeFactory() );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = storeFactory();
    } else {
        // Browser globals
        root.ReaderlyStorage = storeFactory();
    }
}(this, function () {

	"use strict";


	var ReaderlyStorage = function () {
	/* ( None ) -> ReaderlyStorage
	* 
	*/
		var rSto = {};

		rSto.set = function ( settings, callback ) {
		// Set any number of settings values
			// Docs say no args returned
			chrome.storage.sync.set( settings, callback );
		};  // End rSto.set()


		rSto.save = rSto.set;


		rSto.loadAll = function ( callback ) {
			chrome.storage.sync.get( null, function loadOldReaderlySettings( settings ) {
				callback( settings );
			});
		};  // End rSto.loadAll()


		rSto.get = function ( keyOrKeys, callback ) {
			chrome.storage.sync.get( keyOrKeys, function loadOldReaderlySettings( settings ) {
				callback( settings );
			});
		};  // End rSto.get()


		rSto.cleanSave = function ( settings, callback ) {
			chrome.storage.sync.clear( function clearReaderlySettings() {
				// Docs say no args returned
				chrome.storage.sync.set( settings, callback );
			});
		};  // End rSto.cleanSave()


		rSto.clear = function ( callback ) {
			// Docs say no args returned
			chrome.storage.sync.clear( callback );
		};  // End rSto.clear()


		rSto.remove = function ( keyOrKeys, callback ) {
			// Docs say no args returned
			chrome.storage.sync.remove( keyOrKeys, callback );
		};  // End rSto.remove()


		return rSto;
	};  // End ReaderlyStorage() -> {}

    return ReaderlyStorage;
}));