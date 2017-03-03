// settings-CSS.js
// css that's bundleable


(function (root, settingsCSSFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define( [], function () {
          return ( root.settingsCSS = settingsCSSFactory() );
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = settingsCSSFactory();
    } else {
        // Browser globals
        root.settingsCSS = settingsCSSFactory();
    }
}(this, function () {

  "use strict";

  var settingsCSS = "/* settings.css\
* \
* Refer to main settings script (currently ReaderlySettings.js\
* on 12/20/16) for DOM structure.\
* \
* Affects main settings, settings modules, and playback.\
* Consider name change.\
* \
* TODO:\
* - More robust defualts\
*/\
\
/* ============================== */\
/* SKIN */\
/* ============================== */\
/* Should this be in readerly-main.css? */\
#__rdly button {\
  position: relative;\
  padding: 0;\
  /* functional */\
  cursor: pointer;\
}\
\
#__rdly button,\
#__rdly label,\
#__rdly input {\
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
#__rdly .__rdly-big-menu-button {\
  width: 3em;\
  height: 3em;\
  /* default followed by desired setting */\
  margin: 0;\
  margin-right: .3em;\
}\
\
.__rdly-sup-menu-button {\
  position: relative;\
  top: 0;\
  right: 0;\
  width: 1.5em;\
  height: 1.5em;\
  margin: 0;\
}\
\
/* Solution to transition? https://stackoverflow.com/questions/3508605/how-can-i-transition-height-0-to-height-auto-using-css#8331169 */\
/* See comments on the thread */\
#__rdly_settings_container {\
  width: 100%;\
  display: flex;\
  flex-direction: column;\
}\
\
#__rdly_settings_tabs,\
#__rdly_settings_menus,\
.__rdly_settings_menu {\
  position: relative;\
  width: 100%;\
}\
\
#__rdly_settings_tabs {\
  display: flex;\
  justify-content: center;\
  height: auto;\
  font-size: 1.23em;\
  overflow: hidden;\
}\
\
.__rdly-settings-tab {\
  flex-grow: 1;\
  padding: 0.1em;\
  display: flex;\
  justify-content: center;\
}\
\
#__rdly_settings_menus {\
  height: auto;\
  text-align: center;\
}\
\
#__rdly .__rdly-settings-menu {\
  position: relative;\
  display: flex;\
  flex-wrap: wrap;\
  justify-content: space-around;\
  padding: 0 .5%;\
}\
\
#__rdly .__rdly-setting {\
  /* For more visibility, try even more vertical padding */\
  position: relative;\
  /* % causes weird rendering to happen in flexbox (maybe others too?) */\
  /*padding: 1.3% 1.5%;*/\
  padding: 13px;\
}\
\
#__rdly .__rdly-slider-controls {\
  display: flex;\
  align-items: center;\
  margin-top: 0.2rem;\
}\
\
#__rdly .__rdly-slider-input {\
  text-align: center;\
  width: 3.5em;\
  height: 1.6em;\
  font-size: 16px;\
  margin-right: 0.3em;\
  padding: 0;\
}\
\
#__rdly .__rdly-slider {\
  display: inline-block;\
  width: 150px;\
  height: 10px;\
}\
\
\
\
/* ============================== */\
/* SKIN */\
/* ============================== */\
/*#__rdly_below_bar .__rdly-section-open {\
  border-bottom: 0;\
}*/\
\
#__rdly_settings_container {\
  background-color: rgba( 230, 230, 230, 1);\
}\
\
#__rdly_settings_tabs {\
}\
.__rdly-settings-tab {\
  border-right: 1px solid gray;\
  border-bottom: 1px solid gray;\
  background-color: rgba(160, 160, 160, 1);\
}\
.__rdly-settings-tab:last-child {\
  border-right: 0;\
}\
.__rdly-active-tab {\
  background-color: rgba( 230, 230, 230, 1);\
  fill: rgba(100, 100, 100, 1);\
  border-bottom: none;\
}\
\
\
#__rdly .__rdly-slider-label {\
  font-size: 21px;\
}\
\
#__rdly .__rdly-slider-input {\
  -webkit-border-radius: 3px;\
  -moz-border-radius: 3px;\
  -ms-border-radius: 3px;\
  -o-border-radius: 3px;\
  border-radius: 3px;\
  -webkit-box-shadow: inset 1px 1px 3px rgba(179, 179, 179, 1);\
  -moz-box-shadow: inset 1px 1px 3px rgba(179, 179, 179, 1);\
  box-shadow: inset 1px 1px 3px rgba(179, 179, 179, 1);\
  /* Inset look with better color control */\
  border-top: 2px solid gray;\
  border-left: 2px solid gray;\
  border-right: 2px solid rgba(180,180,180, 1);\
  border-bottom: 2px solid rgba(180,180,180, 1);\
}\
\
#__rdly .__rdly-slider-input:focus {\
  border: 1px solid #3498db;\
  -webkit-border-radius: 2px;\
  -moz-border-radius: 2px;\
  -ms-border-radius: 2px;\
  -o-border-radius: 2px;\
  border-radius: 2px;\
}\
";

  // To put on the window object, or export into a module
    return settingsCSS;
}));
