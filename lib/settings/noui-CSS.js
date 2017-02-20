// noui-CSS.js
// css that's bundleable


(function (root, nouiCSSFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( [], function () {
        	return ( root.nouiCSS = nouiCSSFactory() );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = nouiCSSFactory();
    } else {
        // Browser globals
        root.nouiCSS = nouiCSSFactory();
    }
}(this, function () {

	"use strict";

	var nouiCSS = "/* noUi.css */\
\
.noUi-target,\
.noUi-target * {\
  -webkit-touch-callout: none;\
  -webkit-user-select: none;\
  -ms-touch-action: none;\
  -ms-user-select: none;\
  -moz-user-select: none;\
  -moz-box-sizing: border-box;\
  box-sizing: border-box;\
}\
\
/* instead of background, it seems, in v8 */\
.noUi-target {\
  background: #FAFAFA;\
  box-shadow: inset 0 1px 1px #B3B3B3;\
  border: 1px solid rgba( 80, 80, 80, 1 );\
}\
\
.noUi-base {\
  width: 100%;\
  height: 100%;\
  position: relative;\
}\
\
.noUi-origin {\
  position: absolute;\
  right: 0;\
  top: 0;\
  left: 0;\
  bottom: 0;\
}\
\
.noUi-handle {\
  position: relative;\
  z-index: 1;\
}\
\
.noUi-stacking .noUi-handle {\
  /* This class is applied to the lower origin when\
     its values is > 50%. */\
  z-index: 10;\
}\
\
.noUi-stacking + .noUi-origin {\
  /* Fix stacking order in IE7, which incorrectly\
     creates a new context for the origins. */\
  /* *z-index: -1; - Original. Meant to be this way? */\
  z-index: -1;\
}\
\
.noUi-state-tap .noUi-origin {\
  /*-webkit-transition: left 0.3s, top 0.3s;*/\
  /*transition: left 0.3s, top 0.3s;*/\
}\
\
.noUi-state-drag * {\
  cursor: inherit !important;\
}\
\
/* Slider size and handle placement */\
.noUi-horizontal {\
  height: 18px;\
}\
\
.noUi-horizontal .noUi-handle {\
  width: 32px;\
  height: 20px;\
  /* Can't do adjustable height that's good with small sizes (min-height) with no min-top too :/ */\
  /*min-height: 20px;*/\
  /*height: 140%;*/\
  /*top: 69%;*/\
  left: -16px;\
  /* vertical centering without flexbox */\
  top: 50%;\
  transform: translateY(-50%);\
}\
\
.noUi-vertical {\
  width: 18px;\
}\
\
.noUi-vertical .noUi-handle {\
  width: 28px;\
  height: 34px;\
  left: -6px;\
  top: -17px;\
}\
\
.noUi-vertical.noUi-extended {\
  padding: 15px 0;\
}\
\
.noUi-vertical.noUi-extended .noUi-origin {\
  height: 100%;\
  bottom: -15px;\
}\
\
/* Styling */\
.noUi-background {\
  background: #FAFAFA;\
  box-shadow: inset 0 1px 1px #B3B3B3;\
  border: 1px solid gray;\
}\
\
.noUi-connect {\
  position: absolute;\
  height: 100%;\
  background: #3498DB;\
  box-shadow: inset 0 0 3px rgba(51, 51, 51, 0.45);\
  /*border: 3px double black;*/\
  /*border: 1px solid rgba( 80, 80, 80, 1 );*/\
  -webkit-transition: background 450ms;\
  transition: background 450ms;\
}\
\
.noUi-origin {\
  border-radius: 2px;\
}\
\
.noUi-target {\
  box-shadow: inset 0 1px 1px #f0f0f0, 0 3px 6px -5px #bbbbbb;\
}\
\
/* Handles and cursors */\
.noUi-dragable {\
  cursor: w-resize;\
}\
\
.noUi-vertical .noUi-dragable {\
  cursor: n-resize;\
}\
\
.noUi-handle {\
  border: 1.5px solid #959191;\
  border-radius: 3px;\
  background: #FFF;\
  cursor: default;\
  box-shadow: inset 0 0 1px white, inset 0 1px 7px #ebebeb, 0 3px 6px -3px #bbbbbb;\
}\
\
.noUi-active {\
  box-shadow: inset 0 0 1px white, inset 0 1px 7px #dddddd, 0 3px 6px -3px #bbbbbb;\
}\
\
/* Handle stripes */\
.noUi-handle:before,\
.noUi-handle:after {\
  content: '';\
  display: block;\
  position: absolute;\
  height: 14px;\
  width: 1px;\
  background: #959191;\
  left: 14px;\
  top: 2px;\
}\
\
.noUi-handle:after {\
  left: 16px;\
}\
\
.noUi-vertical .noUi-handle:before,\
.noUi-vertical .noUi-handle:after {\
  width: 14px;\
  height: 1px;\
  left: 6px;\
  top: 14px;\
}\
\
.noUi-vertical .noUi-handle:after {\
  top: 17px;\
}\
\
/* Disabled state */\
[disabled].noUi-connect,\
[disabled] .noUi-connect {\
  background: #B8B8B8;\
}\
\
[disabled] .noUi-handle {\
  cursor: not-allowed;\
}\
\
/* Blocked state */\
.noUi-state-blocked.noUi-connect,\
.noUi-state-blocked .noUi-connect {\
  background: #4FDACF;\
}\
\
/* Containing handles within the slider bar (horizontal) */\
.noUi-horizontal.noUi-extended {\
	/*padding-right: 32px;*/\
  /* ??: Why is 32px not working? https://refreshless.com/nouislider/more/ bottom*/\
  padding-right: 30px;\
}\
.noUi-horizontal.noUi-extended .noUi-handle {\
	left: -1px;\
}\
.noUi-horizontal.noUi-extended .noUi-origin  {\
	right: -32px;\
}\
\
/*  PROGRESSS BAR AND SCRUBBER  */\
#__rdly_progress .noUi-handle {\
  top: 6px;\
  height: 15px;\
}\
#__rdly_progress .noUi-handle::before,\
#__rdly_progress .noUi-handle::after {\
  height: 80%;\
  top: 50%;\
  transform: translateY(-50%);\
}\
";

	// To put on the window object, or export into a module
    return nouiCSS;
}));
