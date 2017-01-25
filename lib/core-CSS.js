/* core-CSS.js
* css that's bundleable
* 
* Scroll bars issue:
* https://jsfiddle.net/fpd4fb80/31/
*/

(function (root, coreCSSFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( [], function () {
        	return ( root.coreCSS = coreCSSFactory() );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = coreCSSFactory();
    } else {
        // Browser globals
        root.coreCSS = coreCSSFactory();
    }
}(this, function () {

	"use strict";

	var coreCSS = "/*readerly-main.css\
* \
* Refer to main display script (currently ReaderlyDisplay.js\
* on 12/20/16) for DOM structure.\
* \
* Affects mostly main display, but also others.\
* \
* TODO:\
* - Implement more robust hiding. (jQuery .hide type thing atm)\
* - More robust defaults.\
*/\
\
/* ============================== */\
/* STRUCTURE */\
/* ============================== */\
#__rdly_iframe {\
	position: fixed;\
	top: 0;\
	left: 0;\
	width: 100%;\
	z-index: 4300200100;\
}\
html, body {\
	height: 100%;\
	overflow: hidden;\
}\
\
#__rdly,\
#__rdly * {\
	box-sizing: border-box;\
}\
\
#__rdly {\
	display: flex;\
	flex-direction: column;\
	max-height: 100%;\
	top: 0;\
	left: 0;\
	width: 100%;\
	transition: top 100ms linear;\
}\
\
.__rdly-main-section {\
	width: 100%;\
	display: flex;\
	/* For absolutely positioned children */\
	position: relative;\
}\
\
/* Should be 'top' and 'bottom' instead? */\
#__rdly #__rdly_above_bar {\
	top: 0;\
	/* function */\
	z-index: 50;\
}\
\
#__rdly_below_bar {\
	top: 100%;\
	display: flex;\
}\
\
#__rdly #__rdly_bar {\
	/* ??: Will this work if font-size is declared lower down? */\
	min-height: 2em;\
	text-align: center;\
}\
\
/* ??: Generalize positions? Left, right, top, bottom, center, middle? */\
#__rdly .__rdly-bar-left,\
#__rdly .__rdly-bar-center,\
#__rdly .__rdly-bar-right {\
	/* vertically centered without flexbox */\
	position: absolute;\
	top: 50%;\
	transform: translateY(-50%);\
	height: 100%;\
	display: flex;\
	align-items: center;\
	align-content: center;\
	justify-content: center;\
}\
#__rdly .__rdly-bar-left,\
#__rdly .__rdly-bar-right {\
	padding: 0.75%;\
}\
#__rdly .__rdly-bar-left {\
	left: 0;\
}\
#__rdly .__rdly-bar-center {\
	height: 100%;\
	text-align: center;\
}\
#__rdly .__rdly-bar-right {\
	right: 0;\
}\
#__rdly #__rdly_close {\
	align-self: flex-start;\
}\
\
#__rdly #__rdly_text_elements {\
	/* em counts the widest possible text */\
	width: 13em;\
	height: 100%;\
}\
\
/* Horizontally and vertically centered without flexbox */\
/* Comes last to take precedence */\
#__rdly .__rdly-transform-centered {\
	position: absolute;\
	top: 50%;\
	left: 50%;\
	transform: translate( -50% ,-50% );\
}\
\
\
/* ============================== */\
/* SKIN */\
/* ============================== */\
#__rdly_iframe {\
	border: 0;\
}\
body {\
	margin: 0;\
}\
\
#__rdly div,\
#__rdly span,\
#__rdly a,\
#__rdly li {\
	/* font defaults from chrome inspection */\
	font-family: 'droid', serif;\
	font-size: 16px;\
	line-height: normal;\
	font-style: normal;\
	font-weight: normal;\
	font-variant: none;\
	font-stretch: normal;\
	font-feature-settings: normal;\
	font-kerning: auto;\
	-webkit-font-smoothing: auto;\
	text-transform: none;\
}\
\
#__rdly {\
	/*border: 1px solid gray;*/\
	/*border-left: 0;*/\
	/*border-right: 0;*/\
	background-color: rgba(250, 250, 250, 1);\
}\
\
.__rdly-main-section {\
	border: 0;\
	border-bottom: 1px solid gray;\
}\
\
#__rdly #__rdly_bar,\
#__rdly #__rdly_bar div,\
#__rdly #__rdly_bar span,\
#__rdly #__rdly_bar a,\
#__rdly #__rdly_bar li {\
	font-size: 36px;\
}\
\
\
/* Should this be in readerly-main.css? new readerly-ui.css?*/\
#__rdly button::-moz-focus-inner,\
#__rdly input::-moz-focus-inner {\
	/*padding: 0;*/\
	/*background-color: rgba( 220, 220, 220, 1 );*/\
}\
\
#__rdly button {\
	border-radius: 3px;\
}\
\
#__rdly button {\
  background-color: rgba( 220, 220, 220, 1 );\
}\
#__rdly button:active {\
	background-color: rgba( 200, 200, 200, 1 );\
}\
#__rdly button:hover,\
#__rdly .__rdly-active-ui {\
	background-color: rgba(160, 160, 160, 1);\
	fill: rgba(100, 100, 100, 1);\
}\
/* TODO: add:\
#__rdly .__rdly-active-ui {\
  border-style: inset;\
}\
*/\
\
\
/* ============================== */\
/* FUNCTION */\
/* ============================== */\
\
#__rdly .__rdly-hidden {\
	display: none;\
}\
\
#__rdly .__rdly-rotating {\
    -webkit-animation:spin 4s linear infinite;\
    -moz-animation:spin 4s linear infinite;\
    animation:spin 4s linear infinite;\
}\
@-moz-keyframes spin {\
	100%\
	{ -moz-transform: rotate(360deg); }\
}\
@-webkit-keyframes spin {\
	100%\
	{ -webkit-transform: rotate(360deg); }\
}\
@keyframes spin {\
	100%\
	{ transform:rotate(360deg); }\
}\
\
#__rdly .__rdly-scrollable-y {\
	display: block;\
	overflow-y: scroll;\
	overflow-x: hidden;\
}\
\
#__rdly .__rdly-scrollable-y > * {\
	height: auto;\
	overflow: visible;\
}\
";

	// To put on the window object, or export into a module
    return coreCSS;
}));
