/* ReaderlySettings.js
* 
* Should manage settings. Don't put them directly in here
* one by one. This should have functions that allow this
* object to be extended.
* 
* TODO:
* ??: Add events/buttons for things like opening and closing settings?
* - ??: Don't close settings when closing readerly? If they were there
* 	on close, should they be there on re-open?
* - Stop scrolling on doc when being scrolled
*/

(function (root, settingsFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( ['jquery', './settings/settings-CSS'], function ( jquery, settingsCSS ) {
        	return ( root.ReaderlySettings = settingsFactory( jquery, settingsCSS ) );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = settingsFactory( require('jquery'), require('./settings-CSS') );
    } else {
        // Browser globals
        root.ReaderlySettings = settingsFactory( root.jQuery, root.settingsCSS );
    }
}(this, function ( $, settingsCSSstr ) {

	"use strict";

	var ReaderlySettings = function ( timer, coreDisplay ) {

		var rSet = {};

		rSet.settings = {};

		rSet.nodes 				= {};
		rSet.menuNodes 			= {};
		rSet._destroyTabEvent 	= null;
		rSet._changeIDsEvent 	= null;

		rSet._isOpen 			= false;

		var opener, container, menus, tabs;


		// =========== ALLOW EXTENTIONS OF SETTINGS =========== \\

		// ---- Add a tab to go with the settings ---- \\
		rSet._hideLoneTab = function () {
		/* Make sure that if there's only one settings element,
		* the tabs don't show
		*/
			if ( Object.keys(rSet.menuNodes).length <= 1 ) {
				$(tabs).addClass( '__rdly-hidden' );
				$(tabs).css( {'display': 'none'} );
			} else {
				$(tabs).removeClass( '__rdly-hidden' );
				$(tabs).css( {'display': 'flex'} );
			}
			return rSet;
		};

		rSet._showMenu = function ( evnt ) {
		// Sent from a tab, DOES NOT SHOW THE NODE THAT CONTAINS ALL THE MENUS
		// Shows one individual menu, hiding the other menu nodes
			var $thisTab = $(evnt.target),
				id 		 = evnt.target.id.replace(/_tab$/, ''),
				$menus 	 = $(menus).find( '.__rdly-settings-menu' ),
				$tabs 	 = $(tabs).children(),
				thisMenu = rSet.menuNodes[ id ];

			// Hide all, then show this one
			// $menus.addClass( '__rdly-hidden' );
			// $(thisMenu).removeClass( '__rdly-hidden' );
			$menus.addClass( '__rdly-hidden' );
				$menus.css( {'display': 'none'} );
			$(thisMenu).removeClass( '__rdly-hidden' );
				$(thisMenu).css( {'display': 'flex'} );
			// There should only be one (for now...). It's height gets adjusted.
			// Should only have one child, which can grow.
			$menus.removeClass( '__rdly-to-grow' );
			$(thisMenu).addClass( '__rdly-to-grow' );

			// Same type of thing, showing this tab as active
			$tabs.removeClass( '__rdly-active-ui' );
			$thisTab.addClass( '__rdly-active-ui' );

			return rSet;
		};

		rSet.destroyMenu = function ( evnt ) {
			var id = evnt.target.id;  // jQuery element? Need to get [0] item?

			$(rSet.menuNodes[ id ]).remove();
			rSet.menuNodes[ id ] = null;
			$($(tabs).find('#' + id + '_tab' )).remove();

			return rSet;
		};

		rSet._addTab = function ( id, tabText ) {
			var html = '<div id="' + id + '_tab" class="__rdly-settings-tab">' + tabText + '</div>',
				$tab = $( html );
			$tab.appendTo( tabs );
			rSet._hideLoneTab();

			$tab.on( 'touchend click', rSet._showMenu )

			return $tab;
		};

		rSet.addMenu = function ( menu ) {// node, tabText ) {

			var node 	= menu.node,
				tabText = menu.tabText;

			var id = node.id;

			// Abort if already exists
			if ( rSet.menuNodes[ id ] ) {
				// Not sure how else to handle this gracefully...
				// Just refuse to add something with this ID? That seems cruel.
				console.warn( "A settings menu of this id is already in here. Please pick a different id or use someManager.destroyMenu( 'someID' ) to destroy it. Existing menu:", rSet.menuNodes[ id ] );
				return node;
			}

			rSet.menuNodes[ id ] = node;

			// Otherwise keep going
			var $newNode = $(node);
			$newNode.addClass( '__rdly-settings-menu' );

			$(menus).append( $newNode );
			$newNode[0].addEventListener( 'destroyOneSettingsMenu', rSet._removeMenu, false );  // TODO: Remove this line
			rSet.settings[ menu.id ] = menu;

			var $tab = rSet._addTab( id, tabText );

			// Show the first menu added each time, just in case?
			$($(tabs).children()[0]).trigger( 'click' );

			return rSet;
		};  // End rSet.addMenu()


		// =========== BASE OBJECT =========== \\
		rSet._open = function () {
			$(coreDisplay.nodes.below).removeClass('__rdly-hidden');
			$(opener).addClass( '__rdly-active-ui' );  // different style
			rSet._isOpen = true;

			coreDisplay.update();
			// Seems to be a Chrome issue going on. Need to call this twice with a delay.
			// Don't remember what it is, but it's not from lag. Something really doesn't
			// work until this is called for the second time. Something to do with height: 0
			setTimeout(coreDisplay.update, 4);

			return rSet;
		};

		rSet.close = function ( evnt ) {
		// Allowed to be called externally
			$(coreDisplay.nodes.below).addClass('__rdly-hidden');
			$(opener).removeClass( '__rdly-active-ui' );  // different style
			rSet._isOpen = false;
			coreDisplay.update();
			return rSet;
		};

		rSet._toggleOpenClose = function () {
			if ( rSet._isOpen ) {
				rSet.close();
			} else {
				rSet._open();
			}
			return rSet;
		};

		rSet._onBlur = function ( evnt ) {
			var parent = $(evnt.target).parents('#__rdly_settings_container')[0]
			if ( !parent ) {
				// If they've clicked the "open settings" button, toggle
				if ( evnt.target === rSet.nodes._openSettings ) {
					rSet._toggleOpenClose();
				// Otherwise they're just getting out of the settings menu, so close
				// ??: Allow users to click other buttons while settings are open?
				// They may realize they want to pause while they're changing the
				// settings, so maybe not.
				} else {
					rSet.close();
				}
			}
			return rSet;
		};

		rSet._addEvents = function () {
			// $('#__rdly').on( 'touchend click', rSet._onBlur );  // See question above
			$(opener).on( 'touchend click', rSet._toggleOpenClose );
			return rSet;
		};


		rSet._addBase = function ( coreDisplay ) {
			var $open = $('<button id="__rdly_open_settings" class="__rdly-big-menu-button">Set</button>'),
				$cont = $('<div id="__rdly_settings_container"></div>'),
				$taby = $('<div id="__rdly_settings_tabs"></div>'),
				$sets = $('<div id="__rdly_settings_menus" class="__rdly-scrollable-y"></div>');

			var coreNodes 	= coreDisplay.nodes,
				head 		= coreNodes.head,
				left  		= coreNodes.barLeft,
				below 		= coreNodes.below;

			var nodes 	= rSet.nodes;
			opener 		= nodes._openSettings 	 	= $open.prependTo( left )[0];
			container 	= nodes._settingsContainer 	= $cont.prependTo( below )[0];
			tabs 		= nodes._tabs 			 	= $taby.appendTo( $cont )[0];
			menus 		= nodes._menus 		 		= $sets.appendTo( $cont )[0];

			// STYLES
			settingsCSSstr 	= '<style>' + settingsCSSstr + '</style>';
			var $css 		= $(settingsCSSstr);
			$css.appendTo( head );

			return rSet;	
		};

		rSet._destroy = function () {
			opener.remove();
			container.remove();

			// $('#__rdly').off( rSet._onBlur );

			return rSet;
		};

		rSet._init = function ( coreDisplay ) {

			// // Not sure yet why you'd want to rebuild this object from
			// // scratch, but going to offer the option for now
			// if ( $('#__rdly_open_settings') ) { rSet._destroy(); }

			rSet._addBase( coreDisplay )
				._addEvents();

			coreDisplay.addToTriggerList( rSet );

			return rSet;
		};



		// =========== CREATE =========== \\
		// Don't show at start, only when prompted
		rSet._init( coreDisplay );

		// To be called in a script
		return rSet;
	};  // End ReaderlySettings() -> {}

	// To put on the window object, or export into a module
    return ReaderlySettings;
}));
