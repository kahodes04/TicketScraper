/* Log Wrapper ~ END */
//jQuery.noConflict();

var isPhone = MobileEsp.isMobilePhone,
    isTablet = MobileEsp.isTierTablet;

jQuery(document).ready(function ($) {
    /**********************
     * Font loader ~ START
     **********************/
    var webFontConfig = {
        classes: false
        , custom: {
            families: fcbConfig.fontLoader.fontFamilies
        }
        , loading: function () {
            // console.log('loading - This event is triggered when all fonts have been requested.');
        }
        , active: function () {
            // console.log('active - This event is triggered when the fonts have rendered.');
            $(window).trigger('webFontsActive');
            $(window).trigger('fcbResize');
        }
        , inactive: function () {
            // console.info('inactive - This event is triggered when the browser does not support linked fonts or if none of the fonts could be loaded.');
        }
        , fontloading: function (familyName, fvd) {
            // console.log('fontloading - This event is triggered once for each font that\'s loaded. => ' + familyName);
        }
        , fontactive: function (familyName, fvd) {
            // console.log('fontactive - This event is triggered once for each font that renders. => ' + familyName);
            // $(window).trigger('webFontsActive'); // JE removed this 26.02 as test - I think we need only one active call
        }
        , fontinactive: function (familyName, fvd) {
            //alert(familyName);
            // console.info('fontinactive - This event is triggered if the font can\'t be loaded. => ' + familyName);
        }
    };
    WebFont.load(webFontConfig);
    /*********************
     * Font loader ~ END
     *********************/

    /*********************
     * Global ResizeEvent
     *********************/
    $(window).on('resize', zo.debounce(function () {
        $(window).trigger('fcbResize');
    }, 20, false));

    /*********************
     * Global Scroll
     *********************/
    $(window).on('scroll', zo.debounce(function () {
        $(window).trigger('fcbScroll');
    }, 70, false));

    /***************************
     * Global Scroll Top-Button
     **************************/
    $('.scroll-top').on('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        TweenLite.to(window, 1, {
            scrollTo: {
                y: 0
                , x: 0
            }
            , ease: Power2.easeInOut
        });
    });

    /************************************
     * AutoInit of modules
     ************************************/
    zo.autoInit = zo.autoInit || {};

    for (var key in zo.autoInit) {
        if (zo.autoInit.hasOwnProperty(key)) {
            zo.autoInit[key] = new zo.autoInit[key]();
            zo.autoInit[key].init();
        }
    }

    // Dummy Footer


});
