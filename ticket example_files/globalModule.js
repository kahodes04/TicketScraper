(function ($, global) {
    var log = new zo.log();
    log.setConfig({
        'moduleName': 'Global'
    });
    log.activeDebug = false;

    /*******************************************
     * MODULE: GLOBAL
     *******************************************/
    var GlobalModule = function () {
        //operation variables
        this.scrollPosition = 0;

        //elements
        this.$body = null;

        //class definitions
        this.classActive = 'active';
        this.classPageNoScroll = 'page-no-scroll';
        this.classDetectiOS = 'ios-device';
        this.classDetectTouch = 'touch-device';
        this.classContentNaviHash = 'content-navi';
        this.classContentNaviAnchor = this.classContentNaviHash + '-anchor';

        //module: overlay
        this.classOverlayFade = 'fade-in';
        this.overlayInactiveHideTime = 0.05;
        this.overlayInactiveShowTime = 0.4;

        this.overlayShowTime = 0.4;
        this.overlayShowEase = Power3.easeOut;

        this.overlayHideTime = 0.4;
        this.overlayHideEase = Power3.easeOut;

        this.intervalDynamicLabels = null;

        this.currentBreakpoint = null;
    };

    GlobalModule.prototype.init = function () {
        this.$body = $('body');

        this.initGlobals();
        this.enhanceMarkup();

        $(window).on('fcbResize webFontsActive', this.renderUnderlinedHeadlines.bind(this));
        //fcbResize
        $(window).on('resize', this.checkBreakpoints.bind(this));

        $(window).trigger('fcbGlobalModuleActive');
    };

    GlobalModule.prototype.initGlobals = function () {
        //detect IE - will be detected inside zoJsLib directly
        //this.initDetectIE();

        // SocialSharing init
        this.initSocialSharing();

        //check for current breakpoint
        this.checkBreakpoints();

        //init dynamic labels
        this.initDynamicLabelElements();

        //init dynamic labels for birthdays
        this.initDynamicLabelBirthdays();

        //init date labels
        this.initDateLabels();

        //init cookieBar
        this.initDisclaimerCookieBox();

        //check scroll to content navigation
        this.scrollPageToContentNavigationOnHash();
    };

    GlobalModule.prototype.enhanceMarkup = function () {
        //detect devices
        this.detectDevices();

        //underline headlines
        this.renderUnderlinedHeadlines();
    };

    /*******************************
     * DETECT IE
     ******************************/
    GlobalModule.prototype.initDetectIE = function () {
        var ieVersion = zo.detectIE();

        if (ieVersion !== false) {
            $('html').addClass('ie').addClass('ie-' + ieVersion);
        }
    };

    /*******************************
     * SocialSharing ~ START
     ******************************/
    GlobalModule.prototype.initSocialSharing = function () {

        var $buttonsContainer = $('.social-media-integration .shariff:not(.initialized)');
        if ($buttonsContainer.length) {

            new Shariff($buttonsContainer, {
                orientation: 'vertical'
            });
            $buttonsContainer.addClass('initialized');
        }

    };
    /*******************************
     * SocialSharing ~ START
     ******************************/

    /***************************
     * ENHANCE MARKUP
     **************************/
    GlobalModule.prototype.renderUnderlinedHeadlines = function () {
        $('h1.underline, h2.underline, h3.underline, h4.underline, h5.underline, h6.underline').each(function () {

            var $buttons = $(this).closest('.fcb-row').nextAll('.fcb-row.buttons');

            if ($(this).closest('.large-headline').length || $buttons.length) {
                return;
            }


            var text = $.trim($(this).text())
                , textAsArray = text.split(" ")
                , lastWord = textAsArray.slice(-1)
                ;

            // Wrap last Word
            lastWord = '<span class="last-word">' + lastWord + '<span class="underline"></span></span>';

            // Replace
            textAsArray[textAsArray.length - 1] = lastWord;

            // Set new Text
            $(this).html(textAsArray.join(" "));

            var $lastWord = $(this).find('.last-word')
                , $underline = $lastWord.find('.underline')
                , underlinePositionLeft = $lastWord.position().left + $lastWord.outerWidth(true);

            // Set underline position
            $underline.css({
                left: underlinePositionLeft
            });
        });
    };

    GlobalModule.prototype.detectDevices = function () {

        if (MobileEsp.DetectIos()) {
            this.$body.addClass(this.classDetectiOS);
        }

        if (typeof Modernizr != 'undefined' && Modernizr.touchevents) {
            this.$body.addClass(this.classDetectTouch);
        }
    };


    /***************************
     * BREAKPOINT CHECKER
     **************************/
    GlobalModule.prototype.checkBreakpoints = function () {
        var dataBreakpoint = zo.getBreakpoint();

        if (this.currentBreakpoint !== dataBreakpoint.breakpoint) {
            this.currentBreakpoint = dataBreakpoint.breakpoint;
            $(window).trigger('fcbGrid', dataBreakpoint);
        }
    };

    /***************************
     * DATE FORMAT LABELS
     **************************/

    GlobalModule.prototype.initDateLabels = function () {
        this.initDateLabelsMatchCenter();
        this.initDateLabelsMatchPlan();
    };

    GlobalModule.prototype.initDateLabelsMatchCenter = function () {
        var $elements = $('.matchday[data-date-start]');

        $elements.each(function (index, el) {
            var $entry = $(el),
                $entryDate = $entry.find('.matchday-date'),
                $entryTime = $entry.find('.matchday-time'),
                dateStartString = $entry.attr('data-date-start'),
                dateEndString = $entry.attr('data-date-end'),
                dateStart = null,
                dateEnd = null,
                outputDate = '',
                outputTime = '',
                outputText = '',
                isDateRange = false
                ;

            if (typeof dateEndString !== 'undefined' && dateEndString !== '') {
                //get date values
                //add end date (without time)
                dateEnd = new Date(dateEndString);
                isDateRange = true;
                $entryDate.addClass('no-time');
            }

            if (typeof dateStartString !== 'undefined' && dateStartString !== '') {
                dateStart = new Date(dateStartString);
                outputDate = zo.getFormattedDate(dateStart);
            }

            if (isDateRange) {
                outputDate = zo.getFormattedDateNoYear(dateStart);
                outputDate += ' - ' + zo.getFormattedDate(dateEnd);
                outputTime = '';

            } else {
                //add time to output date
                outputDate = zo.getFormattedDate(dateStart);
                outputTime = zo.getFormattedTime(dateStart, false);
            }

            //outputText = $entryDate.html();
            //outputText = outputText.replace(/~dateOutput~/, outputDate);
            $entryDate.text(outputDate);

            //update time
            if ($entryTime.length > 0) {
                //outputText = $entryTime.html();
                //outputText = outputText.replace(/~timeOutput~/, outputTime);
                $entryTime.text(outputTime);
            }
        });
    };

    GlobalModule.prototype.initDateLabelsMatchPlan = function () {
        var $elements = $('.fcb-matchplan-entry, .focus-match');

        $elements.each(function (index, el) {
            var $entry = $(el),
                $entryDate = $entry.find('.match-time'),
                $entryTime = $entry.find('.game-score-time > .time'),
                dateStartString = $entry.attr('data-date-start'),
                dateEndString = $entry.attr('data-date-end'),
                dateStart = null,
                dateEnd = null,
                outputDate = '',
                outputTime = '',
                outputText = '',
                isDateRange = false
                ;

            if (typeof dateEndString !== 'undefined' && dateEndString !== '') {
                //get date values
                //add end date (without time)
                dateEnd = new Date(dateEndString);
                isDateRange = true;
            }

            if (typeof dateStartString !== 'undefined' && dateStartString !== '') {
                dateStart = new Date(dateStartString);
                outputDate = zo.getFormattedDate(dateStart);
            }

            if (isDateRange) {
                outputDate = zo.getFormattedDateNoYear(dateStart);
                outputDate += ' - ' + zo.getFormattedDate(dateEnd);
                outputTime = fcbConfig.datepicker.timeDefault;

            } else {
                //add time to output date
                outputDate = zo.getFormattedDate(dateStart);
                outputDate += ' | ' + zo.getFormattedTime(dateStart);
                outputTime = zo.getFormattedTime(dateStart, true);
            }

            //outputText = $entryDate.html();
            //outputText = outputText.replace(/~dateOutput~/, outputDate);
            $entryDate.text(outputDate);

            //update time
            if ($entryTime.length > 0) {
                //outputText = $entryTime.html();
                //outputText = outputText.replace(/~timeOutput~/, outputTime);
                $entryTime.text(outputTime);
            }
        });
    };


    /***************************
     * DYNAMIC LABELS
     **************************/
    GlobalModule.prototype.initDynamicLabelElements = function () {
        var _this = this
            , $elements = $('[data-date-publication]').not('.' + fcbConfig.dynamicLabels.selectorElementWasUpdated)
            ;

        //show dynamic labels
        zo.showDynamicLabels($elements);

        //add interval to update dynamic labels
        clearInterval(this.intervalDynamicLabels);
        this.intervalDynamicLabels = setInterval(function () {
            //check if there are any dynamic labels to update
            var $labelsUpdated = $('.' + fcbConfig.dynamicLabelSettings.selectorElementKeepUpdated);

            if ($labelsUpdated.length > 0) {
                zo.showDynamicLabels($labelsUpdated);
                log.d('DYNAMIC LABELS: keep interval dynamic labels interval');
            } else {
                clearInterval(_this.intervalDynamicLabels);
                log.d('DYNAMIC LABELS: abort interval dynamic labels interval');
            }
        }, (1000 * fcbConfig.dynamicLabels.interval));
    };

    GlobalModule.prototype.initDynamicLabelBirthdays = function () {
        var _this = this
            , $elements = $('[data-date-birth]').not('.' + fcbConfig.dynamicLabels.selectorElementWasUpdated)
            , $element = null
            , valueDate = ''
            , birthDate = null
            ;

        $elements.each(function () {
            $element = $(this);

            //get attribute with date information of element
            valueDate = $element.attr('data-date-birth');

            //prepare display date
            birthDate = new Date(valueDate);
            valueDate = zo.getFormattedDate(birthDate);

            //insert display date into markup
            $element.find('.dynamic-label.type-birth').text(valueDate).addClass('is-rendered');
        });
    };

    /***************************
     * PAGE OVERLAY
     **************************/
    GlobalModule.prototype.enablePageOverlay = function (enableOverlay) {
        if (enableOverlay) {
            //store current scroll position
            this.scrollPosition = $(document).scrollTop();

            //add fixed position to body
            this.$body.css('top', this.scrollPosition * (-1));

            //disable page scroll
            this.$body.addClass(this.classPageNoScroll);
        } else {
            //enable page scroll
            this.$body.removeClass(this.classPageNoScroll).removeAttr('style');

            //scroll page to previous scroll position
            this.scrollPageToPosition(this.scrollPosition, false);
        }
    };

    GlobalModule.prototype.scrollPageToPosition = function (position, flagAnimation) {
        //handle optional params
        var enableAnimation = true;

        if (typeof flagAnimation !== 'undefined') {
            enableAnimation = flagAnimation;
        }

        //scroll page to position
        if (enableAnimation) {
            //scroll with animation
            TweenLite.to(window, 1, {
                scrollTo: {
                    y: position
                    , x: 0
                }
                , ease: Power2.easeInOut
            });
        } else {
            //scroll without animation
            $('html, body').scrollTop(position);
        }
    };

    /***************************
     * NOTIFICATION HANDLING
     **************************/
    GlobalModule.prototype.notificationLoaderStartDelayedMessage = function ($notification) {
        var $notificationContent = $notification.find('.notification-content')
            , delayContent = 2
            , animTime = 0.3
            ;

        TweenLite.set($notificationContent, {
            opacity: 1
            , height: 'auto'
        });

        TweenLite.from($notificationContent, animTime, {
            height: '0px'
            , opacity: 0
            , delay: delayContent
        });
    };


    /***************************
     * OVERLAY HANDLING
     **************************/
    GlobalModule.prototype.actionOverlayOpen = function ($overlay, functionInitOverlay, context) {

        //initialize overlay
        if (functionInitOverlay) {
            functionInitOverlay($overlay, context);
        }

        // if needed then move the Overlay to the end of the body
        if ($overlay.attr('data-move-position')) {
            $('body').append($overlay);
        }

        //disable page scroll
        this.enablePageOverlay(true);

        //slide in menu overlay
        TweenLite.set(
            $overlay,
            {
                left: '0%'
                , right: '0%'
                , display: 'block'
            }
        );
        TweenLite.from(
            $overlay,
            this.overlayShowTime,
            {
                left: '100%'
                , right: '-100%'
                , ease: this.overlayShowEase
            }
        );
    };

    GlobalModule.prototype.actionOverlayClose = function ($overlay, flagSubMenu) {
        //close overlay (for menu and datepicker)
        var isSubMenu = false;

        if (typeof flagSubMenu !== 'undefined') {
            isSubMenu = flagSubMenu;
        }

        //slide out and hide overlay
        TweenLite.to(
            $overlay,
            this.overlayHideTime,
            {
                left: '100%'
                , right: '-100%'
                , ease: this.overlayHideEase
                , onComplete: function () {
                //enable page scroll again
                if (!isSubMenu) {
                    log.d('ENABLE SCROLL');
                    this.enablePageOverlay(false);
                }

                $overlay.removeAttr('style');
            }.bind(this)
            }
        );
    };

    GlobalModule.prototype.actionOverlayShowLayer = function ($overlay, flagFadeInLayer) {
        var $inactiveLayer = $overlay.find('.fcb-overlay-inactive-layer');

        if (flagFadeInLayer) {
            //FADE IN DARKENING
            $inactiveLayer.addClass(this.classActive);

            TweenLite.to(
                $inactiveLayer,
                this.overlayInactiveHideTime,
                {
                    onComplete: function () {
                        $inactiveLayer.addClass(this.classOverlayFade);
                    }.bind(this)
                }
            );
        } else {
            //FADE OUT DARKENING
            $inactiveLayer.removeClass(this.classOverlayFade);

            TweenLite.to(
                $inactiveLayer,
                this.overlayInactiveShowTime,
                {
                    onComplete: function () {
                        $inactiveLayer.removeClass(this.classActive);
                    }.bind(this)
                }
            );
        }
    };

    /***************************
     * BREAKPOINT CHECKER
     **************************/
    GlobalModule.prototype.isElementInViewport = function ($element, positionTestObject, toleranceFactor) {
        var offsetTop = $element.offset().top
            , offsetTopAndHeight = offsetTop + $element.outerHeight()
            , positionTestObject = positionTestObject
            , factor = toleranceFactor || 1.5
            , viewport = {}
            ;

        /***** example for positionTestObject: *****
         positionTestObject = {
				viewportWidth: zo.innerSize().width
				, viewportHeight: zo.innerSize().height * 1.5
				, currentScrollTop: $(document).scrollTop()
			};
         *****/

        if (positionTestObject === null) {
            viewport = zo.innerSize();

            positionTestObject = {
                viewportWidth: viewport.width
                , viewportHeight: viewport.height * factor
                , currentScrollTop: $(document).scrollTop()
            };
        }

        var inViewport = offsetTop.between(positionTestObject.currentScrollTop, positionTestObject.currentScrollTop + positionTestObject.viewportHeight);

        if (!inViewport) {
            inViewport = offsetTopAndHeight.between(positionTestObject.currentScrollTop, positionTestObject.currentScrollTop + positionTestObject.viewportHeight);
        }

        return inViewport;
    };

    /***************************
     * SCROLL TO CONTENT NAVI
     **************************/
    GlobalModule.prototype.scrollPageToContentNavigationOnHash = function() {
        var _this = this
            , $anchorElement = null
            ;

        //check for jump mark
        if (location.hash.indexOf(this.classContentNaviHash) != -1) {
            //search for anchor element
            $anchorElement = $('#' + _this.classContentNaviAnchor);

            //if there is anchor element -> scroll to
            if ($anchorElement.length > 0 && $('.fcb-base-overview-wrapper').length === 0) {
                //wait till position of elements are correct rendered
                setTimeout(function () {
                    //get top position where to scroll to
                    var posTop = $anchorElement.offset().top;

                    TweenLite.to(window, 1, {
                        scrollTo: {y: posTop}
                        , ease: Power2.easeOut
                        //, delay: 0.1
                    });
                }, 1500);
            }
        }
    };

    /***************************
     * DISCLAIMER COOKIE BOX
     **************************/
    GlobalModule.prototype.initDisclaimerCookieBox = function ($element, positionTestObject, toleranceFactor) {
        if(!$.cookie) {
            return;
        }
        var cookieName = 'cookie_disclaimer'
            , cookie_disclaimer = $.cookie(cookieName)
            , $disclaimer = $(".cookie-disclaimer");

        if (cookie_disclaimer !== 'true') {
            $disclaimer.removeClass('hidden');
            $(".button.cookie-submit").click(function (ev) {
                ev.preventDefault();

                $.cookie(cookieName, 'true', {expires: 10000, path: '/'});
                $disclaimer.addClass('hidden');
            });
        }

        $('.button.delete-cookie').click(function (ev) {
            ev.preventDefault();
            $disclaimer.removeClass('hidden');
        });
    };

    global.zo = global.zo || {};
    global.zo.autoInit = global.zo.autoInit || {};
    global.zo.autoInit.Global = GlobalModule;
})(jQuery, window);
