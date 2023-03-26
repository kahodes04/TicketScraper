(function ($, global) {

    var log = new zo.log();
    log.setConfig({
        moduleName: 'Header'
        , moduleBackgroundColor: '#A051BC',
    });
    log.activeDebug = false;

    /*******************************************
     * MODULE: PARENT
     *******************************************/
    var HeaderModule = function () {
        this.header = null;
        this.headerClass = 'header-wrapper';
        this.isTouchDevice = $('html').hasClass('touchevents');

        this.isInitialResize = true; //BaNI true
    };

    HeaderModule.prototype.init = function () {
        
        var _this = this;

        //check for browsers with touch screen and mouse input
        if(this.isTouchDevice) {
            if(!MobileEsp.isTierTablet && !MobileEsp.isAndroid && !MobileEsp.isMobilePhone) {
                $('html').removeClass('touchevents');
                this.isTouchDevice = false;
            }
        }

        $('.' + _this.headerClass).each(function () {
            //create instance of header
            _this.header = new Header($(this), _this).init();
        });

        if(_this.header === null) {
            //stop further initialization
            return false;
        }

        $(window).on('fcbResize', function (event) {
            _this.header.handleResize();
        });

        $(window).on('fcbGrid', function (event, data) {
            _this.header.handleGridChange(data);
        });

        $(window).on('scroll', function (event) {
            //_this.timeoutScroll = setTimeout(function () {
            _this.header.scrollHandler();
            //}, 30);
        });
    };

    /*******************************************
     * MODULE: HEADER
     *******************************************/
    var Header = function ($element, _parent) {
        this._parent = _parent;
        /*************************
         * ELEMENTS
         *************************/
        this.$element = $element;
        this.$headerNavigation = $element.find('.header-navigation');

        this.$buttonsLevel1 = $element.find('.header-navigation .level-1 > li > a');
        this.$buttonsLevel2 = $element.find('.header-navigation .level-2 > li > a');
        this.$buttonsLevel1Wrapper = $element.find('.header-navigation .level-1');

        this.$navigation = $element.find('.header-navigation');

        //more button of large/xlarge header
        this.$buttonMore = this.$buttonsLevel1Wrapper.find('> li.action-more');

        //menu button of medium header
        this.$buttonMenu = $element.find('.button-menu');

        //login button of header
        this.$buttonLoginWrapper = $element.find('.button-login');
        this.$buttonLogin = $element.find('.button-login .button-login-element');
        this.$buttonLoginOpenTooltip = this.$element.find('.header-actions .button-login-element .fcb-tooltip-click');

        //search input element
        this.$searchInputWrapper = $element.find('.header-search-wrapper');
        this.$searchInputBox = this.$searchInputWrapper.find('.search-input-wrapper');
        this.$buttonSearchButtonOpen = this.$searchInputWrapper.find('.search-button-open');
        this.$buttonSearchButtonClose = this.$searchInputWrapper.find('.search-button-close');
        this.$buttonSearchSubmit = this.$searchInputWrapper.find('.search-button-submit');


        //content elements of header
        this.$columnTitle = $element.find('.column-title');
        this.$columnNavigation = $element.find('.column-navigation');
        this.$columnActions = $element.find('.column-actions');

        //elements of flyout
        this.$flyouts = $element.find('.header-flyout-wrapper');
        this.$flyoutsContents = this.$flyouts.find('.header-flyout-navigation');
        this.$flyoutsColumns = this.$flyouts.find('.column-flyout');
        this.$flyoutOpenedButton = null;

        //element for languageSwitch
        this.$languageSwitchParent = this.$element.find('.language-switch');
        this.$languageSwitchValueTargetWrapper = this.$languageSwitchParent.find('.tooltip-select-wrapper > div:first');
        this.$languageSwitchSelectBox = this.$languageSwitchParent.find('select');

        /*************************
         * CONSTANTS
         *************************/
        this.breakpoint = fcbConfig.breakpointKey.large;

        /*************************
         * STATUS HANDLING
         *************************/
        this.isClickable = false;
        this.hasMobileNavigation = false;
        this.isSearchOpened = false;
        this.isSearchClosing = false;
        this.isFlyoutClosing = false;
        this.isFlyoutAnimating = false;
        this.isInitialReset = true;
        this.isBreakpointDesktop = true;
        this.isEnabledLogin = false; //BaNi true

        this.isMobileNavigationOpened = false;

        this.lastScrollTop = null;
        this.lastFlyoutHeight = 0;
        this.lastFlyoutIndex = 0;

        this.timeoutScroll = null;
        this.isAnimatingHeader = false;
        this.isAbsoluteHeader = true;

        this.timeoutMouseLeave = null;
        
        this.isLoggedIn = LoginStateForHeaderModule; //wird in userlogin deklariert
        this.flagTriggerLogout = false;

        this.headerRelationCheck = 0.01;
        this.headerRelationCheckIE = 0.07;

        var ieVersion = zo.detectIE();
        if(ieVersion) {
            if(ieVersion <= 10) {
                this.headerRelationCheck = this.headerRelationCheckIE;
            }
        }

        /*************************
         * CLASS DEFINITIONS
         *************************/
        this.classActive = 'active';
        this.classActiveNavigation = 'active-navigation';
        this.classActiveLogin = 'active-login';

        this.classHideTeaser = 'hide-teaser';
        this.classNavigationSecond = 'second-navigation';
        this.classNavigationNone = 'no-navigation';
        this.classHidden = 'type-hidden';
        this.classMobile = 'type-mobile';
        this.classExtension = 'type-extension';
        this.classActiveSearch = 'active-search';
        //this.classPageNoScroll = 'page-no-scroll';
        this.classNaviScroll = 'enable-scroll-navigation';
        this.classActionSubmenu = 'action-submenu';
        this.classActionExternal = 'action-external';
        this.classActionBack = 'action-back';
        this.classActionMore = 'action-more';
        this.classNoSubmenu = 'no-submenu';
        this.classNoSublevelMore = 'no-sublevel-more';
        this.classNoLoginButton = 'no-login-button';

        this.classMobileNaviActive = 'mobile-navi-active';

        this.classInactiveFade = 'fade-in';

        this.classDisableTooltip = 'fcb-tooltip-disabled';

        this.classPageVariantAllianz = 'allianz-arena';
        this.classPageVariantKidsClub = 'kids-club';

        /*************************
         * SETTINGS
         *************************/
        this.zindexFlyoutDefault = 400;
        this.zindexFlyoutActive = 401;

        this.numberOfEntriesLevel2 = 10;

        this.headerHeightOffset = 0;

        this.mouseleaveTimeoutMilliseconds = 200;

        //animate loginButton on mobile
        this.timeAnimateLoginButton = 0.3;

        //toggle flyout navigation on mouseenter
        this.timeoutNavigationFlyout = null;
        this.timeNavigationFlyout = 150;

        //toggle desktop flyout navigation
        this.toggleDesktopTime = 0.3;
        this.toggleDesktopTimeClose = 0.4;
        this.toggleDesktopEaseDown = Power3.easeOut;
        this.toggleDesktopEaseUp = Power3.easeOut;

        //toggle desktop level 3
        this.toggleDesktopTimeLevel3 = 0.3;
        this.toggleDesktopEaseDownLevel3 = Power3.easeOut;
        this.toggleDesktopEaseUpLevel3 = Power3.easeOut;

        //slide mobile navigation (up/down)
        this.toggleMobileTime = 0.5;
        this.toggleMobileEaseDown = Power3.easeOut;
        this.toggleMobileEaseUp = Power3.easeOut;

        //slide mobile navigation (left/right)
        this.slideTimeIn = 0.3;
        this.slideTimeOut = 0.5;
        this.slideEaseIn = Power3.easeOut;
        this.slideEaseOut = Power3.easeOut;

        //animate out header on scroll
        this.slideHeaderTime = 0.45;
        this.slideHeaderEaseIn = Power1.easeOut;
        this.slideHeaderEaseOut = Power1.easeOut;

        //animate search input
        this.searchAnimationTime = 0.4;
        this.searchEaseShow = Power4.easeOut;
        this.searchEaseHide = Power3.easeOut;

        this.labelLanguage = fcbConfig.localization.textLanguage;

        //storage of element
        this.$element.data({
            fcbHeader: this,
        });
    };

    Header.prototype.init = function () {
        var _this = this;

        //check for touch device
        if (this._parent.isTouchDevice) {
            this.isClickable = true;
        }

        //check for disabled login function
        if (_this.$element.hasClass(_this.classNoLoginButton)) {
            this.isEnabledLogin = false;
        }

        _this.breakpoint = zo.getBreakpoint().breakpoint;

        //enhance markup
        //_this.initEnhanceMarkupWithSVGs();
        _this.initEnhanceMarkup();

        //init Elements
        _this.initElements();

        //bind events for header
        _this.bindEvents();

        //initialize SSO functionality
        //_this.requestSSO(); //BaNi

        //test cookie
        //_this.testCookie();
        //_this.testCookie2();

        //check for login state
        //_this.initLoginStatus(); //BaNi

        //modify position of presented by
        _this.updatePresentedBy();

        return this;
    };

    /************************************************************
     *
     * ENHANCE MARKUP
     *
     ************************************************************/

    Header.prototype.initEnhanceMarkupWithSVGs = function () {
        var $sponsorLogos = this.$element.find('.header-presented-by .presented-partner a img');

        $sponsorLogos.each(function () {
            zo.injectSVG($(this), true);
        });
    };

    Header.prototype.initEnhanceMarkup = function () {
        var $level2 = this.$element.find('.header-navigation .level-2')
            , $levelNone = this.$element.find('.' + this.classNavigationNone)
            , $currentLevel2 = null
            , $entriesLevel2 = null
            , $extensionLevel2 = null
            , numberFirstColumn = 0
            , flagTwoColumnLevel2 = false
            , $teasers = null
            ;

        //hide more-button by default
        this.$buttonMore.hide();

        //loop over all level 2 and apply two column layout (if necessary)
        for (var i = 0; i < $level2.length; i++) {
            $currentLevel2 = $($level2[i]);
            $entriesLevel2 = $currentLevel2.find('> li');
            flagTwoColumnLevel2 = false;

            //adjust level 2 navigation
            if ($entriesLevel2.length > this.numberOfEntriesLevel2) {
                numberFirstColumn = Math.ceil($entriesLevel2.length / 2);

                $extensionLevel2 = $('<ul class="level-2 ' + this.classExtension + '"></ul>');
                $entriesLevel2.slice(numberFirstColumn, $entriesLevel2.length).appendTo($extensionLevel2);

                $currentLevel2.parent().append($extensionLevel2);
                $currentLevel2.closest('.header-flyout-wrapper').addClass(this.classNavigationSecond);

                flagTwoColumnLevel2 = true;
            }

            //adjust displayed teasers
            $teasers = $currentLevel2.closest('.header-flyout-wrapper').find('.teaser-flyout');

            if (flagTwoColumnLevel2) {
                //check that there are just 2 teasers (for level 2 navigation with two columns)
                if ($teasers.length > 2) {
                    //$teasers.slice(2, $teasers.length).addClass(this.classHideTeaser);
                    $teasers.slice(2, $teasers.length).remove();
                }
            } else {
                //check that there are just 3 teasers (for default level 2 navigation)
                if ($teasers.length > 3) {
                    //$teasers.slice(3, $teasers.length).addClass(this.classHideTeaser);
                    $teasers.slice(3, $teasers.length).remove();
                }
            }
        }

        //check number of teasers for flyouts without level2 navigation
        for (var i = 0; i < $levelNone.length; i++) {
            $teasers = $($levelNone[i]).find('.teaser-flyout');

            //check that there are not more than 4 teasers (if there is no level 2 navigation)
            if ($teasers.length > 4) {
                //$teasers.slice(4, $teasers.length).addClass(this.classHideTeaser);
                $teasers.slice(4, $teasers.length).remove();
            }
        }

        //check if navigation 'more button' has level 2 navigation
        if (this.$buttonMore.find('.column-flyout-navigation .level-2').length <= 0) {
            log.d('CREATE LEVEL 2 FOR MORE');

            this.$buttonMore.addClass(this.classActionSubmenu);
            this.$buttonMore.find('.header-flyout-wrapper').removeClass(this.classNavigationNone);

            //create empty level-2
            this.$buttonMore.find('.column-flyout-navigation').append('<ul class="level-2"></ul>');
        }

        //BREAKPOINT: MEDIUM
        //if(global.zo.innerSize().width <= fcbConfig.breakpointsMax.maxBreakpointMedium) {
        if (this.breakpoint !== fcbConfig.breakpointKey.large) {
            //remove tooltip event for loginButton
            this.$buttonLogin.find('.fcb-tooltip').addClass(this.classDisableTooltip);

            //update status
            this.isBreakpointDesktop = false;
        }
    };

    Header.prototype.enhanceLevel2Layout = function () {
        var $flyouts = this.$element.find('.header-flyout-wrapper.' + this.classNavigationSecond)
            , $currentLevel2 = null
            , $entriesLevel2 = null
            , $extensionLevel2 = null
            ;

        //applies two column layout again for level 2 on xlarge/large (if neccessary)
        for (var i = 0; i < $flyouts.length; i++) {
            $extensionLevel2 = $($flyouts[i]).find('.level-2.' + this.classExtension);

            if ($extensionLevel2.find('> li').length === 0) {
                //apply two column layout and divide entries of original level 2 list
                $currentLevel2 = $extensionLevel2.prev();
                $entriesLevel2 = $currentLevel2.find('> li');

                if ($entriesLevel2.length > this.numberOfEntriesLevel2) {
                    numberFirstColumn = Math.ceil($entriesLevel2.length / 2);

                    $entriesLevel2.slice(numberFirstColumn, $entriesLevel2.length).appendTo($extensionLevel2);
                }
            }
        }
    };

    Header.prototype.enhanceExternalLinks = function () {
        //var $buttonsLevel1 = this.$element.find('.header-navigation .level-1 > li.' + this.classActionExternal)
        var $buttonsLevel1 = this.$element.find('.header-navigation li.' + this.classActionExternal)
            , $button = null
            , $buttonLink = null
            , buttonText = ''
            , buttonIcon = null
            ;

        log.d($buttonsLevel1.length);

        for (var i = 0; i < $buttonsLevel1.length; i++) {
            $button = $($buttonsLevel1[i]);

            //add label to provide special styling for external links
            $buttonLink = $button.find('> a');

            $buttonIcon = $buttonLink.find('.icon');

            if ($buttonIcon.length > 0) {
                $buttonLink.html('<span class="label-external">' + $buttonLink.html() + '</span>');
            } else {
                buttonText = $buttonLink.text();
                $buttonLink.html('<span class="label-external">' + buttonText + '</span>');
            }
        }
    };

    Header.prototype.enhanceMoreButtonTeasers = function () {
        var $teaser = []
            , $buttonsLevel2 = []
            , numberToShow = 4
            ;

        //check number of teasers in more-button
        $teasers = this.$buttonMore.find('.teaser-flyout');
        $buttonsLevel2 = this.$buttonMore.find('.level-2 > li');

        if ($buttonsLevel2.length > 0) {
            numberToShow--;
        }

        for (var i = 0; i < $teasers.length; i++) {
            if (i < numberToShow) {
                $($teasers[i]).removeClass('hidden');
            } else {
                $($teasers[i]).addClass('hidden');
            }
        }
    };


    /************************************************************
     *
     * ELEMENTS
     *
     ************************************************************/

    Header.prototype.initElements = function () {
        this.initElementsLanguageSwitch();
        this.initElementsSearch();

        //this.initElementsLoginButton();
    };

    Header.prototype.initElementsLanguageSwitch = function () {
        //update language switch with current selected locale
        if (fcbConfig) {
            if (fcbConfig.locale) {
                //init languageSwitch
                this.setLanguageValue(fcbConfig.locale, this.$languageSwitchSelectBox, this.$languageSwitchValueTargetWrapper);
            }
        }
    };

    Header.prototype.initElementsSearch = function() {
        //update language switch with current selected locale
        this.$searchInputField = this.$searchInputWrapper.find('input');
    };


    /************************************************************
     *
     * EVENTS
     *
     ************************************************************/

    Header.prototype.bindEvents = function () {
        var _this = this;
        //event for languageSwitch element
        this.bindEventsLanguageSwitch();

        //event for menuButton to open navigation for mobile
        this.bindEventsMenuButton();

        //event for loginButton to open login menu
        this.bindEventsLoginButton();

        //event for level 1: show flyout (desktop)/show level 2 (mobile)
        this.bindEventsLevel1(this.$buttonsLevel1, 'click');

        //event to close flyout navigation (desktop)
        this.bindEventsCloseNavigationFlyout();

        this.bindEventsKeepOpenNavigationFlyout();

        //event for level 2: show level 3
        this.bindEventsLevel2(this.$buttonsLevel2);

        //open/close search
        this.bindEventsSearchButtonOpen();
        this.bindEventsSearchButtonClose();
        this.bindEventsSearchSubmit();

        //bind events for logout action
        this.bindEventsLogoutActions($('.action-logout'));

        //bind events for tooltip
        this.bindEventsOpenTooltip();
    };

    /************************************************************
     *
     * EVENT DEFINITIONS
     *
     ************************************************************/

    Header.prototype.bindEventsSearchButtonOpen = function () {
        var _this = this;

        this.$buttonSearchButtonOpen.on('click touchstart', function (event) {
            event.preventDefault();
            event.stopPropagation();

            log.d('BUTTON: SEARCH INPUT');

            _this.$buttonSearchButtonClose.css('opacity', 1);
            _this.toggleSearchInput();
        });
    };

    Header.prototype.bindEventsSearchButtonClose = function () {
        var _this = this;

        this.$buttonSearchButtonClose.on('click touchstart', function (event) {
            event.preventDefault();
            event.stopPropagation();

            log.d('BUTTON: SEARCH INPUT');
            _this.toggleSearchInput();

            _this.$buttonSearchButtonClose.css('opacity', 0);
        });
    };

    Header.prototype.bindEventsSearchSubmit = function() {
        var _this = this;

        //submit button
        this.$buttonSearchSubmit.on('click touchstart', function(event) {
            event.preventDefault();
            event.stopPropagation();

            _this.submitSearch();
        });

        //enter key
        this.$searchInputField.on('keyup', function(event) {
            var keyCode = (event.keyCode ? event.keyCode : event.which);

            if (keyCode == 13) {
                event.preventDefault();
                event.stopPropagation();

                _this.submitSearch();
            }
        });
    };

    Header.prototype.bindEventsLoginButton = function () {
        var _this = this;

        //submit button
        this.$buttonSearchSubmit.on('click touchstart', function(event) {
            event.preventDefault();
            event.stopPropagation();

            _this.submitSearch();
        });

        //enter key
        this.$searchInputField.on('keyup', function(event) {
            var keyCode = (event.keyCode ? event.keyCode : event.which);

            if (keyCode == 13) {
                event.preventDefault();
                event.stopPropagation();

                _this.submitSearch();
            }
        });
    };

    Header.prototype.bindEventsLoginButton = function() {
        var _this = this;

        this.$buttonLogin.on('click touchstart', function(event) {
            if (_this.breakpoint !== fcbConfig.breakpointKey.large) {
                if (_this.isLoggedIn) {
                    //open logged-in menu
                    event.preventDefault();
                    event.stopPropagation();

                    log.d('BUTTON: LOGIN MENU');
                    _this.toggleLoginMenuMobile($(this));

                } else {
                    //execute login link
                    log.d('BUTTON: GOTO LOGIN');
                }
            }
        });
    };

    Header.prototype.bindEventsMenuButton = function () {
        var _this = this;

        this.$buttonMenu.on('click touchstart', function (event) {
            event.preventDefault();
            event.stopPropagation();

            log.d('BUTTON: CLOSE MENU');

            if (_this.$columnActions.hasClass(_this.classActiveLogin)) {
                //close login overlay
                _this.toggleLoginMenuMobile($(this));
            } else {
                //close mobile navigation
                _this.toggleNavigationMobile($(this));
            }
        });
    };

    Header.prototype.bindEventsLanguageSwitch = function () {
        /* language switch */
        var _this = this
            , $languageSwitchParent = _this.$languageSwitchParent
            , $valueTargetWrapper = _this.$languageSwitchValueTargetWrapper
            , $languageSwitchSelectBox = _this.$languageSwitchSelectBox
            ;

        log.d('BUTTON: LANGUAGE SWITCH');

        //handle language change events
        $languageSwitchSelectBox.on('change', function () {
            _this.setLanguageValueOnChange($languageSwitchSelectBox, $valueTargetWrapper);
        });
    };

    /*
     Header.prototype.bindEventsLanguageSwitchMobile = function() {
     var _this = this
     , $languageSwitches = this.$element.find('li.action-language a')
     , $element = null
     ;

     //handle language change events
     $languageSwitches.on('click', function(event) {
     event.preventDefault();

     $element = $(this);

     if(!$element.parent().hasClass('action-back')) {
     //switch language

     }
     });
     };
     */

    /************************************************************
     *
     * NAVIGATION LINKS
     *
     ************************************************************/

    Header.prototype.bindEventsLevel1Login = function ($buttons, eventListenerName) {
        var _this = this;

        $buttons.on('click', function (event) {
            if (_this.isLoggedIn) {
                //open menu in logged in state
                event.preventDefault();
                event.stopPropagation();

                log.d('CLICK -> OPEN NAVI');

                //slide in level 2 of mobile navigation
                _this.slideInSubNavigationMobile($(this), 1);

            } else {
                //open link to login
            }
        });
    };

    Header.prototype.bindEventsLevel1 = function ($buttons, eventListenerName) {
        //events of level 1 entries
        var _this = this;

        //check for touch/mouse device
        if (!this._parent.isTouchDevice) {
            //MOUSE DEVICE

            //events to open flyout navigation (desktop)
            $buttons.on('mouseenter', function (event) {
                //if(global.zo.innerSize().width > fcbConfig.breakpointsMax.maxBreakpointMedium) {
                if (_this.breakpoint === fcbConfig.breakpointKey.large) {
                    if (!_this.hasMobileNavigation) {
                        if ($(this).parent().hasClass(_this.classActionSubmenu)) {
                            //LARGE/XLARGE: open flyout on mouseenter
                            event.preventDefault();
                            event.stopPropagation();

                            log.d('TOUCH -> OPEN NAVI');

                            //slide down navigation flyout
                            _this.toggleNavigationFlyout($(this), 'open');
                        } else {
                            //close other flyouts
                            _this.closeHeaderFlyout();
                        }
                    }
                }
            });
        }

        //TOUCH DEVICE
        $buttons.on('click', function (event) {
            if ($(this).parent().hasClass(_this.classActionSubmenu)) {

                if (!_this.hasMobileNavigation) {
                    //LARGE/XLARGE: toggle flyout
                    if ($(this).parent().hasClass(_this.classActionMore) || _this._parent.isTouchDevice) {
                        //toggle flyout
                        event.preventDefault();
                        event.stopPropagation();

                        log.d('CLICK -> OPEN NAVI');

                        //slide up/down navigation flyout
                        if ($(this).parent().hasClass(_this.classActive)) {
                            //close flyout
                            _this.toggleNavigationFlyout($(this), 'close');
                        } else {
                            //open flyout
                            _this.toggleNavigationFlyout($(this), 'open');
                        }
                    }

                    //open link

                } else {
                    //MEDIUM/SMALL: slide in sub navigation level 2
                    if (!$(this).parent().hasClass(_this.classActionExternal)  && !$(this).parent().hasClass(_this.classNoSubmenu)) {
                        event.preventDefault();
                        event.stopPropagation();

                        log.d('CLICK -> OPEN NAVI');

                        //slide in level 2 of mobile navigation
                        _this.slideInSubNavigationMobile($(this), 1);
                    }
                }
            }
        });
    };

    Header.prototype.bindEventsCloseNavigationFlyout = function () {
        //close opened navigation flyout
        var _this = this
            , $currentButton = null
            , $triggerElements = null
            ;

        //define which elements should close navigation flyout on mouseleave
        $triggerElements = _this.$element.find('.header-navigation');

        //bind events to close navigation flyout
        $triggerElements.on('mouseleave', function (event) {
            if (!_this.hasMobileNavigation) {
                //close navigation flyout after timeout
                clearTimeout(_this.timeoutMouseLeave);
                _this.timeoutMouseLeave = setTimeout(function () {
                    //get active button
                    $currentButton = _this.$element.find('.header-navigation .level-1 > li.active > a');

                    //close current active navigation flyout
                    _this.toggleNavigationFlyout($currentButton, 'close');
                }, _this.mouseleaveTimeoutMilliseconds);
            }
        });
    };

    Header.prototype.bindEventsKeepOpenNavigationFlyout = function () {
        //close opened navigation flyout
        var _this = this;

        //bind events to keep open navigation flyout
        this.$headerNavigation.on('mouseenter', function (event) {
            if (!_this.hasMobileNavigation) {
                //keep navigation flyout open
                if (_this.$flyoutOpenedButton) {
                    clearTimeout(_this.timeoutMouseLeave);

                    //console.clear();
                    log.d('OPEN FLYOUT KEEP!!!!!');

                    _this.toggleNavigationFlyout(_this.$flyoutOpenedButton, 'open');
                }
            }
        });
    };

    Header.prototype.bindEventsLevel1Back = function () {
        //events of back links in mobile navigation
        var _this = this;

        //MEDIUM/SMALL: back buttons in level 2 and 3
        this.$element.find('.header-flyout-wrapper li.' + this.classActionBack + ' > a').on('click touchstart', function () {
            _this.slideOutSubNavigationMobile($(this));
        });
    };

    Header.prototype.bindEventsLevel2 = function ($buttons) {
        //events of level 2 entries
        var _this = this;

        $buttons.on('click', function (event) {
            if ($(this).parent().hasClass(_this.classActionExternal) || ($(this).parent().hasClass(_this.classNoSublevelMore) && !_this.hasMobileNavigation)) {
                //open link

            } else {
                //check for submenu
                if ($(this).parent().hasClass(_this.classActionSubmenu)) {
                    if (!_this.hasMobileNavigation) {
                        //LARGE/XLARGE: toggle level 3 in flyout navigation
                        event.preventDefault();
                        event.stopPropagation();

                        _this.toggleNavigationFlyoutLevel3($(this));
                    } else {
                        //MEDIUM/SMALL: slide in sub navigation level 3
                        event.preventDefault();
                        event.stopPropagation();

                        _this.slideInSubNavigationMobile($(this), 2);
                    }
                }
            }
        });
    };

    /************************************************************
     *
     * BUTTON ACTIONS
     *
     ************************************************************/

    Header.prototype.submitSearch = function() {
        var searchValue = this.$searchInputField.val();

        location.href = this.$buttonSearchSubmit.attr('href') + '#search=' + searchValue;
    };

    Header.prototype.toggleSearchInput = function () {
        var _this = this;

        if (this.hasMobileNavigation || this.isSearchClosing) {
            return false;
        }

        //handle animation to show search input on desktop
        if (this.isSearchOpened) {
            //CLOSE SEARCH INPUT
            this.isSearchClosing = true;

            //animate search input
            TweenLite.set(this.$searchInputBox, {
                left: '100%',
            });
            TweenLite.from(this.$searchInputBox, this.searchAnimationTime, {
                left: '0%', ease: this.searchEaseHide, onComplete: function () {
                    //disable display of search input
                    _this.$columnActions.removeClass(_this.classActiveSearch);
                    _this.$columnActions.removeAttr('style');

                    _this.$searchInputBox.removeAttr('style');
                    _this.$searchInputWrapper.removeAttr('style');

                    //reset animation status
                    _this.isSearchClosing = false;
                }
                ,
            });

            //set animation status
            _this.isSearchOpened = false;

        } else {
            //OPEN SEARCH INPUT
            var offsetRight = 1;

            if (this.isLoggedIn) {
                offsetRight = 0;
            }

            if ($('body').hasClass(this.classPageVariantAllianz)) {
                offsetRight = -1;
            }

            //prepare right position of searchInput
            //var posRight = Math.round(this.$columnActions.outerWidth()) - parseInt(this.$element.find('.language-switch').position().left) + offsetRight;
            var posRight = this.$columnActions.outerWidth() - Math.round(this.$element.find('.language-switch').position().left);

            //set search active
            this.$columnActions.addClass(this.classActiveSearch);

            //set right position of searchInput
            this.$searchInputWrapper.css({
                right: posRight + 'px',
            });



            //set width of wrapper element
            var posLeft = parseInt(this.$headerNavigation.position().left) - 2;

            this.$columnActions.css({
                left: posLeft + 'px',
            });

            //this.$columnActions.css({ 'top': posTop + 'px' });

            //animate search input
            TweenLite.set(this.$searchInputBox, {
                left: '0%',
            });
            TweenLite.from(this.$searchInputBox, this.searchAnimationTime, {
                left: '100%',
                ease: this.searchEaseShow,
                delay: 0.2,
            });

            //IE FIX
            setTimeout(function() {
                _this.$searchInputBox.find('input').focus();
            }, 200);

            //set animation status
            this.isSearchOpened = true;

            //close all tooltips
            zo.autoInit.Tooltip.closeAllTooltips();
        }
    };

    Header.prototype.toggleLoginMenuMobile = function ($button) {

        var _this = this
            , $loginMenu = $button.parent().find('.content-tooltip-wrapper')
            , isBreakpointSmall = false
            , isLoggedOut = false
            , $labelButton = _this.$buttonLoginWrapper.find('.content-logged-in .button-label')
            , $labelOverlay = _this.$buttonLoginWrapper.find('.button-login-overlay')
            , $iconButton = _this.$buttonLoginWrapper.find('.button-icon')
            ;

        //if(global.zo.innerSize().width <= fcbConfig.breakpointsMax.maxBreakpointSmall) {
        if (this.breakpoint === fcbConfig.breakpointKey.small) {
            isBreakpointSmall = true;
        }

        if (_this.$buttonLoginWrapper.hasClass('status-logged-out')) {
            isLoggedOut = true;
        }

        if ($loginMenu.height() != 0) {
            //CLOSE LOGIN MENU

            //slide up
            TweenLite.to($loginMenu, _this.toggleMobileTime, {
                height: 0, ease: _this.toggleMobileEaseDown, onComplete: function () {
                    //hide login menu
                    $loginMenu.hide();

                    //deactive scroll on page
                    //$('body').removeClass(_this.classPageNoScroll);
                    zo.autoInit.Global.enablePageOverlay(false);
                }
                ,
            });

            //get start position of loginButton animation
            var positionLeft = parseFloat(_this.$buttonLoginWrapper.attr('data-left')) - _this.$buttonLogin.offset().left;

            //var positionTop = _this.$buttonLogin.offset().top;

            //fade out button overlay title
            TweenLite.set($labelOverlay, {
                opacity: 1,
            });

            if (isBreakpointSmall) {
                TweenLite.to($labelOverlay, _this.timeAnimateLoginButton, {
                    opacity: 0,
                });
            } else if (!isBreakpointSmall && !isLoggedOut) {
                TweenLite.to($labelOverlay, _this.timeAnimateLoginButton, {
                    opacity: 0,
                });
            }

            //fade in button label
            if (!isBreakpointSmall) {
                TweenLite.set($labelButton, {
                    display: 'block', opacity: 0,
                });
                TweenLite.to($labelButton, _this.timeAnimateLoginButton, {
                    opacity: 1,
                });
            }

            //fade in button icon
            if (isBreakpointSmall && isLoggedOut) {
                TweenLite.set($iconButton, {
                    display: 'block', opacity: 0,
                });
                TweenLite.to($iconButton, _this.timeAnimateLoginButton, {
                    opacity: 1,
                });
            }

            //animate login button to right
            TweenLite.to(_this.$buttonLoginWrapper, _this.timeAnimateLoginButton, {
                left: positionLeft,

                //top: positionTop,
                onComplete: function () {
                    //hide header title for login
                    _this.$columnActions.removeClass(_this.classActiveLogin);

                    //fade in button on small
                    if (isBreakpointSmall && isLoggedOut) {
                        TweenLite.set(_this.$buttonLogin, {
                            opacity: 0,
                        });
                        TweenLite.to(_this.$buttonLogin, _this.toggleMobileTime, {
                            opacity: 1,
                        });
                    }

                    //reset stylings
                    _this.$buttonLoginWrapper.removeAttr('style');
                    _this.$buttonLoginWrapper.removeAttr('data-left');

                    $labelOverlay.removeAttr('style');
                    $labelButton.removeAttr('style');
                    $iconButton.remove('style');

                    //bring mobile navigation to front
                    _this.$element.removeClass(_this.classMobileNaviActive);
                },
            });

            //show menu button
            this.$buttonMenu.removeClass(this.classActive);

        } else {
            //OPEN LOGIN MENU
            //deactive scroll on page
            //$('body').addClass(_this.classPageNoScroll);
            zo.autoInit.Global.enablePageOverlay(true);

            //bring mobile navigation to front
            this.$element.addClass(this.classMobileNaviActive);

            //get start position of loginButton animation
            var positionLeft = _this.$buttonLoginWrapper.offset().left;
            _this.$buttonLoginWrapper.attr('data-left', positionLeft);

            //show header title for login
            _this.$columnActions.addClass(_this.classActiveLogin);

            //animate login button to left
            TweenLite.from(_this.$buttonLoginWrapper, _this.timeAnimateLoginButton, {
                left: positionLeft,
            });

            //fade in button overlay title (name)
            if (!isLoggedOut) {
                TweenLite.set($labelOverlay, {
                    opacity: 0,
                });
                TweenLite.to($labelOverlay, _this.timeAnimateLoginButton, {
                    opacity: 1,
                });
            }

            //slide down
            $loginMenu.show();
            TweenLite.set($loginMenu, {
                height: 'auto',
            });
            TweenLite.from($loginMenu, _this.toggleMobileTime, {
                height: 0, ease: _this.toggleMobileEaseDown, onComplete: function () {
                    $labelOverlay.removeAttr('style');
                }
                ,
            });

            //show close button
            this.$buttonMenu.addClass(this.classActive);
        }
    };

    /************************************************************
     *
     * LOGIN BUTTONS
     *
     ************************************************************/

    Header.prototype.bindEventsLogoutActions = function ($button) {
        var _this = this;

        $button.on('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            _this.actionTriggerLogoutProcess();
        });
    };

    Header.prototype.bindEventsOpenTooltip = function () {
        var _this = this;

        this.$buttonLoginOpenTooltip.on('click touchstart', function (event) {
            event.preventDefault();

            //bind dynamic events when tooltip opens
            if ($(this).hasClass(_this.classActive)) {
                var $logoutButton = $('.fcb-tooltip-logged-in').find('.action-logout');

                //bind event on logout button
                _this.bindEventsLogoutActions($logoutButton);
            }
        });
    };

    /************************************************************
     *
     * LOGIN ACTIONS
     *
     ************************************************************/

    Header.prototype.initElementsLoginButton = function () {
        //set login link
        //this.$buttonLogin.attr('href', fcbConfig.connections.loginProcess.login.href).removeAttr('target');
    };

    //PREPARE SSO
    Header.prototype.requestSSO = function () {
        //lazy load SSO script from Objective Partner
        log.d('request SSO');
        var _this = this;

        if (!this.isEnabledLogin) {
            return false;
        }

        //lazy load SSO script
        //$.getScript(fcbConfig.connections.loginProcess.ssoUrlScript)
        $.ajax({
            dataType: "script",
            cache: true,
            url: fcbConfig.connections.loginProcess.ssoUrlScript
        })
            .done(function( script, textStatus ) {
                log.d('SSO script loaded');
                log.d(textStatus);
                $(window).trigger('fcbSsoLoaded');
                $('body').addClass('sso-loaded');

                //initialize SSO
                _this.initSSO();
            })
            .fail(function( jqxhr, settings, exception ) {
                log.d('SSO script not loaded');
            });

        //load SSO css
        var linkTag = document.createElement('link');
        linkTag.rel = 'stylesheet';
        linkTag.href = fcbConfig.connections.loginProcess.ssoUrlCSS;
        document.getElementsByTagName('head')[0].appendChild(linkTag);
    };

    Header.prototype.initSSO = function () {
        //initialize SSO after lazy load
        var _this = this;

        var loginOptions = {
            url: fcbConfig.connections.loginProcess.logout.url,
            service: fcbConfig.connections.loginProcess.logout.service,
            onLogin: function (ticket) {
                //callback for login
            },
            onLogout: function () {
                //callback for logout
                log.d('logout callback');

                //trigger callback after successful logout
                _this.actionLogoutAPICallback();
            },
        };

        if (typeof $('.sso-container').ssoLogin !== 'undefined') {
            //login service is available - initialize login/logout service
            $('.sso-container').ssoLogin(loginOptions);
            log.d('SSO is available!');

            //check if logout was already clicked by user (before/while lazy loading)
            if(this.flagTriggerLogout) {
                this.actionLogoutAPITrigger();
            }

        } else {
            //login service is not available
            log.d('SSO is not available!');
        }
    };

    //CHECK LOGIN
    Header.prototype.initLoginStatus = function () {
        if (!this.isEnabledLogin) {
            return false;
        }

        var cookieContent = zo.getCookie(fcbConfig.connections.loginProcess.cookieName);

        if (cookieContent !== '') {
            var profileData = decodeURIComponent(cookieContent);
            profileData = JSON.parse(profileData);

            //update login status
            this.setLoggingStatus(true, profileData);
        }
    };

    Header.prototype.updatePresentedBy = function() {
        if ($('body').hasClass(this.classPageVariantKidsClub)) {
            if (this.breakpoint === fcbConfig.breakpointKey.medium) {
                //get new position for navigation area
                var posRight = this.$columnActions.outerWidth();

                this.$columnNavigation.css('right', posRight);
            }
        }
    };

/*
    Header.prototype.testCookie = function() {
        var test = {
            username: 'Sebastian-Angelo',
            initial1: 'MM',
            image: 'http://www.fcbayern.de/pics/logos/fcb.png',
            image: '../dataDemo/images/guardiola.jpg',
        };

        var testString = JSON.stringify(test);

        zo.writeCookie(fcbConfig.connections.loginProcess.cookieName, testString);
    };

     Header.prototype.testCookie2 = function() {
         var test = {
            loggedin: 'yes'
         };

         var testString = JSON.stringify(test);

         zo.writeCookie(fcbConfig.connections.loginProcess.cookieNameGlobal, testString);
     };
*/

    //LOGOUT
    Header.prototype.actionTriggerLogoutProcess = function () {
        log.d('logout');

        var _this = this
            , $logoutButton = $('.action-logout')
            , $loggingOutMessage = $('.logging-out-message')
        ;

        //prepare logging-out message
        TweenLite.set($loggingOutMessage, {
            opacity: 0,
        });

        //fade out logout button
        $logoutButton.show();
        TweenLite.to($logoutButton, 0.5, {
            opacity: 0
            , onComplete: function () {
                $logoutButton.hide();
                $loggingOutMessage.css({
                    display: 'block',
                });
            },
        });

        //fade in logging-out message
        TweenLite.to($loggingOutMessage, 0.5, {
            opacity: 1
            , delay: 0.5
            , onComplete: function () {
                _this.actionLogoutAPI();
            },
        });
    };

    Header.prototype.actionLogoutAPI = function () {
        //alert('LOGOUT BY API');
        log.d('LOGOUT BY API');

        //logout should be trigger if lazy load of SSO script is still in progress
        this.flagTriggerLogout = true;

        //start logout process
        this.actionLogoutAPITrigger();

        //this.actionLogoutAPICallback();
    };

    Header.prototype.actionLogoutAPITrigger = function () {
        //trigger logout
        if (typeof $('.sso-container').ssoLogin !== 'undefined') {
            $('.sso-container').ssoLogin('logout');
            log.d('Logout from SSO');
        } else {
            //SSO is not available
            log.d('SSO is not available!');
        }
    };

    Header.prototype.actionLogoutAPICallback = function () {
        //close menus

        //close tooltips (desktop)
        zo.autoInit.Tooltip.closeAllTooltips();

        if (this.breakpoint === fcbConfig.breakpointKey.medium) {
            //close mobile profile (medium)
            this.toggleLoginMenuMobile(this.$buttonMenu);

        } else if (this.breakpoint === fcbConfig.breakpointKey.small) {
            //close mobile navigation (small)
            this.toggleNavigationMobile(this.$buttonMenu);
        }

        //update login status -> logged out
        this.setLoggingStatus(false);
    };

    Header.prototype.setLoggingStatus = function ($loggedIn, profileData) {
        var $buttonLoginWrapper = this.$element.find('.button-login');
        if ($loggedIn) {
            $buttonLoginWrapper.removeClass('status-logged-out').addClass('status-logged-in');

            //update profile data
            //this.setLoggingProfileData(profileData);

            //update status
            this.isLoggedIn = true;

        } else {
            $buttonLoginWrapper.removeClass('status-logged-in').addClass('status-logged-out');

            //update status
            this.isLoggedIn = false;
        }
    };

    Header.prototype.setLoggingProfileData = function (profileData) {
        if (typeof profileData !== 'undefined') {
            var $loginOverlay = this.$buttonLoginWrapper
                , $iconTypeIcon = $loginOverlay.find('.button-icon.type-icon')
                , $iconTypeContent = $loginOverlay.find('.button-icon.type-content')
                ;

            //update login elements with profile data (from cookie)
            if (profileData.hasOwnProperty('username')) {
                this.$element.find('.profile-user-name').text(profileData.username);
            }

            if (profileData.hasOwnProperty('image')) {
                //display profile image
                $iconTypeIcon.hide();
                $iconTypeContent.show();

                var $picture = this.$element.find('.profile-user-image');
                $picture.css({
                    display: 'block',
                });
                $picture[0].src = profileData.image;

            } else if (profileData.hasOwnProperty('initial')) {
                //display profile initials
                $iconTypeIcon.hide();
                $iconTypeContent.show();

                this.$element.find('.profile-user-initials').css({
                    display: 'block',
                }).text(profileData.initial);

            } else {
                //display default logged in icon
                $iconTypeIcon.show();
                $iconTypeContent.hide();
            }
        }
    };

    /************************************************************
     *
     * NAVIGATION OVERLAY
     * (MOBILE)
     *
     ************************************************************/

    Header.prototype.toggleNavigationMobile = function ($button) {
        var _this = this;

        //toggle navigation on mobile
        if (_this.$navigation.height() != 0) {
            //CLOSE NAVIGATION
            _this.closeNavigationMobile();

            //remove active state
            $button.removeClass(_this.classActive);

        } else {
            //OPEN NAVIGATION
            //clear previous stylings
            _this.$searchInputBox.removeAttr('style');

            //set position of loginButton for transition
            _this.$buttonLoginWrapper.css('left', Math.round(_this.$buttonLoginWrapper.offset().left) + 'px');
            _this.$buttonLoginWrapper.css('top', _this.$buttonLoginWrapper.offset().top + 'px');

            //disable scrolling of page again
            //$('body').addClass(_this.classPageNoScroll);
            zo.autoInit.Global.enablePageOverlay(true);
            _this.$navigation.addClass(_this.classNaviScroll);
            _this.$navigation.addClass(_this.classActiveNavigation);

            //bring mobile navigation to front
            this.$element.addClass(this.classMobileNaviActive);

            //slide down
            TweenLite.set(_this.$navigation, {
                height: 'auto',
            });
            TweenLite.from(_this.$navigation, _this.toggleMobileTime, {
                height: 0
                , ease: _this.toggleMobileEaseDown
                , onComplete: function () {
                    _this.isMobileNavigationOpened = true;
                },
            });

            //show search input
            _this.$columnActions.addClass(_this.classActiveSearch);

            //fade out search input
            TweenLite.set(_this.$searchInputWrapper, {
                opacity: 0,
            });
            TweenLite.to(_this.$searchInputWrapper, _this.toggleMobileTime, {
                opacity: 1,
            });

            //add active state
            $button.addClass(_this.classActive);
        }
    };

    Header.prototype.closeNavigationMobile = function () {
        var _this = this
            , $currentSlide = null
            , $parentSlide = null
            ;

        //hide parent navigation levels
        $currentSlide = this.$element.find('.' + this.classActiveNavigation);

        $parentSlide = $currentSlide.parents('.header-flyout-wrapper').css('height', '0px');
        $parentSlide = $currentSlide.parents('.header-navigation').css('height', '0px');

        //reset mobile navigation
        this.$element.find('.layer-inactive').removeClass(this.classActive).removeClass(this.classInactiveFade).removeAttr('style');

        //mark mobile navi as inactive
        this.$element.removeClass(this.classMobileNaviActive);

        //slide up
        TweenLite.to($currentSlide, _this.toggleMobileTime, {
            height: 0, ease: _this.toggleMobileEaseUp,
        });

        //fade out search input
        TweenLite.set(_this.$searchInputWrapper, {
            opacity: 0,
        });
        TweenLite.from(_this.$searchInputWrapper, _this.toggleMobileTime, {
            opacity: 1, onComplete: function () {
                //after close/fade out animation is finished - reset stylings
                _this.$buttonLoginWrapper.removeAttr('style');

                //hide search input
                _this.$columnActions.removeClass(_this.classActiveSearch);

                //clear stylings
                _this.$searchInputWrapper.removeAttr('style');

                //set flag for closed mobile navigation
                _this.isMobileNavigationOpened = false;
            }
            ,
        });

        //remove active navigation classes for clean up
        this.$element.find('.' + this.classActiveNavigation).removeClass(this.classActiveNavigation);

        //enable scrolling of page again
        //$('body').removeClass(_this.classPageNoScroll);
        zo.autoInit.Global.enablePageOverlay(false);
        _this.$navigation.removeClass(_this.classNaviScroll);
    };

    Header.prototype.slideInSubNavigationMobile = function ($button, level) {
        var _this = this
            , $currentSlide = null
            , $inactiveLayer = null
            , contentHeight = 0
            ;

        if (level === 1) {
            //level 1 was clicked
            $currentSlide = $button.parent().find('> .header-flyout-wrapper');

            //get inactive layer for current level
            $inactiveLayer = this.$element.find('.layer-inactive.layer-level-1');
            contentHeight = this.$headerNavigation[0].scrollHeight;

        } else if (level === 2) {
            //level 2 was clicked
            $currentSlide = $button.parent().find('> .level-3');

            //get inactive layer for current level
            //$inactiveLayer = $button.closest('.level-2').parent().find('.layer-inactive.layer-level-2');
            $inactiveLayer = this.$element.find('.layer-inactive.layer-level-2');
            contentHeight = $button.closest('.level-2')[0].scrollHeight;
        }

        //fade in inactive layer of current level
        $inactiveLayer.addClass(this.classActive).css({
            height: contentHeight,
        });
        setTimeout(function () {
            $inactiveLayer.addClass(_this.classInactiveFade);
        }, 5);

        //remove active navigation flag
        this.$element.find('.' + this.classActiveNavigation).removeClass(this.classActiveNavigation);

        //add active navigation flag
        $currentSlide.addClass(this.classActiveNavigation).removeAttr('style');

        log.d('CLICK ENTRY');

        //slide in sub menu
        TweenLite.to($currentSlide, _this.slideTimeIn, {
            left: '0%', ease: _this.slideEaseIn,
        });
    };

    Header.prototype.slideOutSubNavigationMobile = function ($button) {
        var _this = this
            , $currentSlide = null
            , $parentSlide = null
            , $inactiveLayer = null
            ;

        //back button of level 3
        $currentSlide = $button.closest('.level-3');
        $parentSlide = $currentSlide.closest('.header-flyout-wrapper');

        //$inactiveLayer = $button.closest('.column-flyout-navigation').find('.layer-inactive');
        //$inactiveLayer = $currentSlide.closest('.level-2').parent().find('.layer-inactive.layer-level-2');
        $inactiveLayer = this.$element.find('.layer-inactive.layer-level-2');

        if ($currentSlide.length === 0) {
            //back button of level 2
            $currentSlide = $button.closest('.header-flyout-wrapper');
            $parentSlide = $currentSlide.closest('.header-navigation');
            $inactiveLayer = this.$element.find('.layer-inactive.layer-level-1');
        }

        //remove active navigation flag from previous navigation
        $currentSlide.removeClass(this.classActiveNavigation);
        $parentSlide.addClass(this.classActiveNavigation);

        //fade out inactive layer of current level
        $inactiveLayer.removeClass(this.classInactiveFade);

        log.d('CLICK BACK');

        //slide out sub menu
        TweenLite.to($currentSlide, _this.slideTimeOut, {
            left: '100%'
            , ease: _this.slideEaseOut
            , onComplete: function () {
                $inactiveLayer.removeClass(_this.classActive);
            },
        });
    };

    /************************************************************
     *
     * NAVIGATION FLYOUT
     * (DESKTOP)
     *
     ************************************************************/

    Header.prototype.toggleNavigationFlyout = function ($button, exclusiveAction) {
        var _this = this
            , indexFlyout = $button.parent().attr('data-index') || 0
            , $currentFlyout = _this.$element.find('.header-flyout-wrapper[data-index="' + indexFlyout + '"]')
            , $previousFlyout = _this.$element.find('.header-flyout-wrapper[data-index="' + _this.lastFlyoutIndex + '"]')
            , $otherFlyouts = _this.$element.find('.header-flyout-wrapper').not('[data-index="' + indexFlyout + '"]')
            , action = exclusiveAction || null
            ;

        log.d('INDEX FLYOUT:', indexFlyout);

        //disable open/close of navigation flyout if flyout is closing by scrolling page
        if (this.isFlyoutClosing) {
            log.d('ABORT FLYOUT EVENT');

            return false;
        }

        //get height of previous flyout
        _this.lastFlyoutHeight = $previousFlyout.height();

        //store previous flyout index
        _this.lastFlyoutIndex = indexFlyout;

        //close other flyouts (instantly) and reset their zindex
        TweenLite.to($otherFlyouts, 0, {
            height: 0, onComplete: function () {
                //reset flyouts
                $otherFlyouts.removeAttr('style');
            }
            ,
        });

        //remove active status from other sibling links
        $button.parent().siblings().removeClass(_this.classActive);

        //stop ongoing animation of current flyout
        if ($currentFlyout.height() != 0 && $currentFlyout.height() !== 'auto') {
            TweenLite.killTweensOf($currentFlyout);
        }

        //toggle current flyout
        if (($currentFlyout.height() != 0 && action !== 'open') || action === 'close') {
            //SLIDE FLYOUT UP
            log.d('CLOSE FLYOUT');

            //remove active
            $button.parent().removeClass(_this.classActive);

            //slide up animation
            TweenLite.to($currentFlyout, _this.toggleDesktopTime,
                {
                    height: 0, ease: _this.toggleDesktopEaseUp, onComplete: function () {
                    //store current flyout height
                    _this.lastFlyoutHeight = 0;

                    //remove reference on opened flyout
                    _this.$flyoutOpenedButton = null;
                },
                });
        } else {
            //if(($currentFlyout.height() === 0 && action === 'open') || action === null) {
            if ((action === 'open') || action === null) {
                //SLIDE FLYOUT DOWN
                log.d('OPEN FLYOUT', $currentFlyout.attr('data-index'));

                //set reference on current flyout
                this.$flyoutOpenedButton = $button;

                // try to load images
                var $imageWrapper = $currentFlyout.find('.image-wrapper:not(.loaded)');
                $imageWrapper.each(function () {
                    log.d($(this));
                    zo.autoInit.ImageLazyLoader.loadSingleImage($(this));
                });

                //reset stylings
                $currentFlyout.removeAttr('style');

                //prepare flyout if header is scrolled to top
                this.updatePositionNavigationFlyout($currentFlyout);

                //upate zindex
                $currentFlyout.css({
                    'z-index': _this.zindexFlyoutActive,
                });

                //close level 3
                $currentFlyout.find('.' + _this.classActionSubmenu).removeClass(_this.classActive);
                $currentFlyout.find('.level-3').removeAttr('style');

                //set current button link as active
                $button.parent().addClass(_this.classActive);

                //slide down animation
                TweenLite.set($currentFlyout, {
                    height: 'auto',
                });
                TweenLite.from($currentFlyout, _this.toggleDesktopTime, {
                    height: _this.lastFlyoutHeight, ease: _this.toggleDesktopEaseDown, onComplete: function () {
                        //store current flyout height
                        _this.lastFlyoutHeight = $currentFlyout.height();
                    }
                    ,
                });
            }
        }
    };

    Header.prototype.updatePositionNavigationFlyout = function ($flyouts, currentScrollPosition) {
        //fix position of flyouts if header is absolute
        if (!this.$element.hasClass('fixed')) {
            var _this = this
                , scrollPos = currentScrollPosition || ($('body').scrollTop() || $('html').scrollTop());

            $flyouts.css({
                top: _this.$element.outerHeight(true) - scrollPos,
            });
        }
    };

    Header.prototype.closeNavigationFlyoutsAll = function (enableScrollToTop) {
        //check for running animation
        if (this.isFlyoutClosing) {
            return false;
        }

        var _this = this
            , $flyouts = _this.$element.find('.header-flyout-wrapper')
            , scrollToTop = enableScrollToTop || false
            ;

        //log.d('CLOSE FLYOUTS!!!');

        //set animation flag
        _this.isFlyoutClosing = true;

        if (scrollToTop) {
            //close flyouts and scroll flyouts up
            TweenLite.to($flyouts, _this.slideHeaderTime, {
                top: 0, height: 0, onComplete: function () {
                    //reset animation flag
                    _this.isFlyoutClosing = false;

                    //update last flyout height
                    _this.lastFlyoutHeight = 0;

                    //remove reference on opened flyout
                    _this.$flyoutOpenedButton = null;

                    //clean active classes
                    _this.$headerNavigation.find('> .level-1 > li').removeClass(_this.classActive);
                }
                ,
            });
        } else {
            //just close flyouts
            TweenLite.to($flyouts, _this.slideHeaderTime, {
                height: 0, onComplete: function () {
                    //reset animation flag
                    _this.isFlyoutClosing = false;

                    //update last flyout height
                    _this.lastFlyoutHeight = 0;

                    //remove reference on opened flyout
                    _this.$flyoutOpenedButton = null;

                    //clean active classes
                    _this.$headerNavigation.find('> .level-1 > li').removeClass(_this.classActive);
                }
                ,
            });
        }
    };

    Header.prototype.toggleNavigationFlyoutLevel3 = function ($button) {
        //get level 3 of current level 2 entry
        var _this = this
            , $currentSubLevel = $button.siblings('.level-3');

        if ($currentSubLevel.height() != 0) {
            //slide up
            TweenLite.to($currentSubLevel, _this.toggleDesktopTimeLevel3, {
                height: 0, ease: _this.toggleDesktopEaseUpLevel3,
            });

            //remove active
            $button.parent().removeClass(_this.classActive);

        } else {
            //add active
            $button.parent().addClass(_this.classActive);

            //slide down
            TweenLite.set($currentSubLevel, {
                height: 'auto',
            });
            TweenLite.from($currentSubLevel, _this.toggleDesktopTimeLevel3, {
                height: 0, ease: _this.toggleDesktopEaseDownLevel3,
            });
        }
    };

    /************************************************************
     *
     * RESIZE HANDLING
     *
     ************************************************************/

    Header.prototype.handleResize = function () {
        var _this = this;

        this.resetStatis();
        this.updateNavigationWidthForLevel1();
    };

    Header.prototype.updateNavigationWidthForLevel1 = function () {
        if (this.isSearchClosing) {
            return false;
        }

        //check for clipped navigation entries
        var $buttonsLevel1Active = this.$buttonsLevel1Wrapper.find('> li').not('.action-more, .' + this.classHidden)
            , $buttonsLevel1Hidden = this.$buttonsLevel1Wrapper.find('> li.' + this.classHidden)
            , $buttonEntry = null
            , $buttonEntryCopy = null
            , $extensionLevel2 = null
            ;

        var posLeftActions = this.$columnActions.position().left;
        var posLeftNavigation = this.$columnNavigation.position().left;
        var posRightNavigation = posLeftNavigation + this.$columnNavigation.outerWidth(true);
        var posRightNavigationNew = 0;
        var posOffset = 0; //25

        //BREAKPOINT: SMALL / MEDIUM
        if (this.breakpoint !== fcbConfig.breakpointKey.large) {
            //remove hidden classes from level 1 entries
            this.$buttonsLevel1.parent().removeClass(this.classHidden);

            return false;
        }

        //BREAKPOINT: LARGE
        if (posRightNavigation > posLeftActions) {
            //log.d('WHILE LARGE')

            //show more button
            this.$buttonMore.show();
            posRightNavigation = posLeftNavigation + this.$columnNavigation.outerWidth(true);

            //move last navigation entries to level 2 of more-button
            while ($buttonsLevel1Active.length > 1) {
                //log.d('WHILE LARGE 1 _ posRightNavigation: ' + posRightNavigation + '  # posLeftActions: ' + posLeftActions);

                $buttonEntry = $buttonsLevel1Active.eq($buttonsLevel1Active.length - 1);

                //store current width of last entry
                $buttonEntry.attr('data-width', $buttonEntry.outerWidth(true));

                //hide last entry
                $buttonEntry.addClass(this.classHidden);

                //check if level 2 version was already created
                if (!$buttonEntry.hasClass('is-copied')) {
                    //mark as copied
                    $buttonEntry.addClass('is-copied');

                    //prepare content for new level 2 entry
                    $buttonEntryCopy = $buttonEntry.clone();
                    $buttonEntryCopy.find('.header-flyout-wrapper').remove();

                    //add sub entries of navigation entry to cloned entry
                    $buttonEntry.find('.level-2').clone().appendTo($buttonEntryCopy);

                    $extensionLevel2 = $buttonEntryCopy.find('.' + this.classExtension);

                    if ($extensionLevel2.length > 0) {
                        //move entries to same sub level
                        $extensionLevel2.find('> li').appendTo($buttonEntryCopy.find('.level-2').eq(0));

                        //remove extension level
                        $extensionLevel2.remove();
                    }

                    //change the sub entries to level 3
                    $buttonEntryCopy.find('.level-2').addClass('level-3').removeClass('level-2');

                    //remove dropdown icon if there are no level 3 entries
                    if($buttonEntryCopy.find('.level-3').length === 0) {
                        $buttonEntryCopy.addClass(this.classNoSublevelMore);
                    }

                    //update level 2 of more-button
                    this.$buttonMore.find('.column-flyout-navigation .level-2').prepend($buttonEntryCopy);

                    //bind events for that level 2 button
                    this.bindEventsLevel2($buttonEntryCopy.find('a'));

                } else {
                    //reuse button
                    this.$buttonMore.find('.level-2 .level-li-1[data-index="' + $buttonEntry.attr('data-index') + '"]').show();
                }

                //update visible buttons of level 1
                $buttonsLevel1Active = this.$buttonsLevel1Wrapper.find('> li').not('.action-more, .' + this.classHidden);

                //recalc positions after moving navigation entry
                posLeftNavigation = this.$columnNavigation.position().left;
                posRightNavigation = posLeftNavigation + this.$columnNavigation.outerWidth(true);

                if (posRightNavigation <= posLeftActions) {
                    //there was no change detected - important to break while loop in that case
                    log.d('STOP ITEM ADJUSTMENT');
                    break;
                }
            }

        } else if ($buttonsLevel1Hidden.length > 0) {
            //show latest hidden entries again if there is enough space in navigation
            var $buttonEntryHidden = $buttonsLevel1Hidden.eq(0);

            while ((posLeftActions - posRightNavigation) > parseInt($buttonEntryHidden.attr('data-width'))) {
                //log.d('WHILE MOBILE _ posLeftAction: ' + posLeftActions + ' _ posRightNavigation: ' + posRightNavigation);

                //show hidden button again...
                $buttonEntryHidden.removeClass(this.classHidden);

                //...and remove from more-button
                this.$buttonMore.find('.level-2 .level-li-1[data-index="' + $buttonEntryHidden.attr('data-index') + '"]').hide();

                //update width of navigation
                posRightNavigation += parseInt($buttonEntryHidden.attr('data-width'));

                //update selection of hidden buttons
                $buttonsLevel1Hidden = this.$buttonsLevel1Wrapper.find('> li.' + this.classHidden);

                if ($buttonsLevel1Hidden.length > 0) {
                    $buttonEntryHidden = $buttonsLevel1Hidden.eq(0);
                } else {
                    //check to hide more button
                    //if(posRightNavigation < posLeftActions) {
                    //hide more button
                    this.$buttonMore.hide();

                    //}

                    break;
                }
            }

            //## apply two column layout for level 2
            this.enhanceLevel2Layout();
        }

        //## show correct number of teasers in more-button flyout ##
        this.enhanceMoreButtonTeasers();

        //clean up after init
        this.$columnNavigation.removeClass('initial-style');
        this.$columnActions.removeClass('initial-style');
    };

    /************************************************************
     *
     * GRID CHANGE HANDLING
     *
     ************************************************************/

    Header.prototype.handleGridChange = function (data) {
        this.breakpoint = data.breakpoint;

        //clean up settings and stylings when breakpoint was switched
        this.clearBreakpointStatus();

        this.updateHeightOffset(data.breakpoint);

        //update navigation content for current breakpoint
        this.updateNavigationContentForBreakpoint(data);

        this.updatePresentedBy();
    };

    Header.prototype.clearBreakpointStatus = function () {
        //check if mobile navigation needs to be closed
        if (this.hasMobileNavigation && this.isMobileNavigationOpened) {
            this.closeNavigationMobile();

            //close search input
            this.$columnActions.removeClass(this.classActiveSearch);

            //close login menu
            this.$columnActions.removeClass(this.classActiveLogin);
            this.$element.find('.content-tooltip-wrapper').removeAttr('style');

            //reset actions
            this.$columnActions.removeAttr('style');

            //show menu button
            this.$buttonMenu.removeClass(this.classActive);
        }

        //check if mobile profile needs to be closed
        if (this.$columnActions.hasClass(this.classActiveLogin)) {
            this.toggleLoginMenuMobile(this.$buttonMenu);
        }
    };

    Header.prototype.updateHeightOffset = function (breakpoint) {
        if ($('body').hasClass(this.classPageVariantKidsClub)) {
            if (breakpoint === fcbConfig.breakpointKey.small) {
                this.headerHeightOffset = 15;
            } else if (breakpoint === fcbConfig.breakpointKey.medium) {
                this.headerHeightOffset = 36;
            } else {
                this.headerHeightOffset = 54;
            }
        }
    };

    Header.prototype.updateNavigationContentForBreakpoint = function (data) {

        if (data.breakpoint !== 'large') {
            //BREAKPOINT: MEDIUM / SMALL
            //SWITCH TO MOBILE NAVIGATION
            this.updateNavigationEnhanceSmallMedium();

        } else {
            //BREAKPOINT: DESKTOP
            //SWITCH TO DESKTOP
            this.updateNavigationEnhanceLarge();
        }
    };

    Header.prototype.updateNavigationEnhanceLarge = function () {
        //SWITCH TO DESKTOP
        //## remove mobile entries from navigation ##
        this.$element.find('.' + this.classMobile).remove();

        //## remove mobile scrollbar ##
        this.$element.find('.header-navigation').perfectScrollbar('destroy');
        this.$element.find('.header-flyout-wrapper').perfectScrollbar('destroy');
        this.$element.find('.level-3').perfectScrollbar('destroy');
        this.$element.find('.content-tooltip-wrapper').perfectScrollbar('destroy');

        //## clean previous stylings ##
        this.$element.find('.header-flyout-wrapper').removeAttr('style');
        this.$element.find('.level-3').removeAttr('style');

        //## add tooltip event for loginButton ##
        this.$buttonLogin.find('.fcb-tooltip').removeClass(this.classDisableTooltip);

        //## apply two column layout for level 2 ##
        this.enhanceLevel2Layout();

        //## enhance content ##
        //			this.enhanceMenuLinks();

        this.isBreakpointDesktop = true;

        //reset mobile status
        this.hasMobileNavigation = false;
    };

    Header.prototype.updateNavigationEnhanceSmallMedium = function () {

        if (this.hasMobileNavigation) {
            return false;
        }

        //SWITCH TO MOBILE
        var _this = this
            , $navigationLevel1 = this.$navigation.find('.level-1')
            , $navigationLevel2 = []
            , $navigationLevel3 = this.$navigation.find('.level-3')
            , $navigationSubLevel2 = null
            , $extensionEntry = null
            , $extensionSibling = null
            , $newButton = null
            , codeButton = ''
            , $subLevel = null
            , backButtonText = ''
            , moreButtonIndex = 0
            , $moreButtons = null
            , $moreButton = null
            , $languageOptions = null
            , codeOptions = ''
            , codeText = ''
            , activeClassTmp = ''
            , $languageOption = null
            ;

        //## hide more button ##
        this.$buttonMore.hide();

        //## remove active classes ##
        $navigationLevel1.find('> li.' + this.classActive).removeClass(this.classActive);

        //## clean up two column layout of level 2
        $navigationSubLevel2 = this.$navigation.find('.level-2.' + this.classExtension);

        for (var i = 0; i < $navigationSubLevel2.length; i++) {
            $extensionEntry = $($navigationSubLevel2[i]);
            $extensionSibling = $extensionEntry.siblings();
            $extensionEntry.find('> li').appendTo($extensionSibling);
        }

        //## append fan shop button ##
        $newButton = this.$columnActions.find('.button-exit').clone();
        $navigationLevel1.prepend($newButton);
        $newButton.attr('target', '_blank');
        $newButton.wrap('<li class="' + this.classMobile + ' ' + this.classActionExternal + ' action-exit"></li>');

        //## append login button ##
        log.d('ADD LOGIN BUTTON');
        $newButton = this.$columnActions.find('.button-login').clone();
        $navigationLevel1.prepend($newButton);

        //provide content for sub-navigation
        $newButton.find('.column-flyout-navigation').html(this.$element.find('#content-tooltip-logged-in').html());
        $newButton.find('ul').addClass('level-2');

        //$newButton.find('.level-2').addClass(this.classExtension);
        $newButton.wrap('<li class="' + this.classMobile + ' ' + this.classActionSubmenu + ' ' + '' + ' action-login"></li>');

        //$navigationLevel1.find('.action-login a').css('border', '1px solid lime');
        this.bindEventsLevel1Login($navigationLevel1.find('.action-login a.button-login-element'), 'click touchstart');
        this.bindEventsLogoutActions($newButton.find('a.action-logout'));

        //check if level 1 entries have submenu content
        var $navigationEntriesLevel1 = $navigationLevel1.find('.level-li-1');

        for (var i = 0; i < $navigationEntriesLevel1.length; i++) {
            var $level1Entry = $($navigationEntriesLevel1[i]);

            if($level1Entry.find('.level-2').length === 0) {
                $level1Entry.addClass(this.classNoSubmenu);
            }
        }

        //get all level 2 contents
        $navigationLevel2 = this.$navigation.find('.level-2');

        //## append back buttons to sub-levels ##
        for (var i = 0; i < $navigationLevel2.length; i++) {
            $subLevel = $($navigationLevel2[i]);

            if (!$subLevel.hasClass(this.classExtension)) {
                backButtonText = $subLevel.closest('li').find('> a').text();

                if ($subLevel.closest('li').hasClass('action-login')) {
                    backButtonText = fcbConfig.localization.textBackLogin;
                }

                $subLevel.prepend('<li class="' + this.classMobile + ' ' + this.classActionBack + '"><a href="#">' + backButtonText + '</a></li>');
            }
        }

        for (var i = 0; i < $navigationLevel3.length; i++) {
            $subLevel = $($navigationLevel3[i]);
            backButtonText = $subLevel.closest('li').find('> a').text();
            $subLevel.prepend('<li class="' + this.classMobile + ' ' + this.classActionBack + '"><a href="#">' + backButtonText + '</a></li>');
        }

        moreButtonIndex = parseInt($navigationLevel1.find('> li.action-more').attr('data-index')) + 1;

        //## remove tooltip event for loginButton ##
        this.$buttonLogin.find('.fcb-tooltip').addClass(this.classDisableTooltip);

        //## append language selection ##
        $languageOptions = this.$columnActions.find('.language-switch select option');
        codeOptions = '<li class="' + this.classActionBack + '"><a href="#">' + this.labelLanguage + '</a></li>';

        for (var i = 0; i < $languageOptions.length; i++) {
            $languageOption = $($languageOptions[i]);

            codeText = $languageOption.text();

            var value = $languageOption.attr('value');
            var href = $languageOption.attr('data-href');

            //check active language
            if (value === fcbConfig.locale) {
                activeClassTmp = 'class="' + this.classActive + '"';
                href = '#';
            } else {
                activeClassTmp = '';
            }

            codeOptions += '<li class=""><a href="' + href + '" ' + activeClassTmp + ' data-value="' + codeText + '">' + codeText + '</a></li>';
        }

        codeButton = '<li class="' + this.classMobile + ' ' + this.classActionSubmenu + ' action-language" data-index="' + moreButtonIndex + '">'
            + '<a href="#">' + this.labelLanguage + '</a>'
            + '<span class="header-flyout-wrapper" data-index="' + moreButtonIndex + '">'
            + '<ul class="level-2">'
            + codeOptions
            + '</ul>'
            + '</span>'
            + '</li>'
        ;
        $navigationLevel1.append(codeButton);
        this.bindEventsLevel1($navigationLevel1.find('.action-language > a'), 'click touchstart');
        this.bindEventsLevel1Back();

        //## clean previous stylings ##
        this.$element.find('.header-flyout-wrapper').removeAttr('style');
        this.$element.find('.level-3').removeAttr('style');

        //## enhance content ##
        this.enhanceExternalLinks();

        //				this.enhanceMenuLinks();

        //update mobile scrollbar
        this.$element.find('.header-navigation').perfectScrollbar();
        this.$element.find('.header-flyout-wrapper').perfectScrollbar();
        this.$element.find('.level-3').perfectScrollbar();
        this.$element.find('.content-tooltip-wrapper').perfectScrollbar();

        this.isBreakpointDesktop = false;

        //update mobile status
        this.hasMobileNavigation = true;
    };

    /************************************************************
     *
     * RESETTING
     *
     ************************************************************/

    Header.prototype.resetStatis = function () {
        //log.d('RESET STATIS');

        //reset temporary settings/classes
        if (this.hasMobileNavigation) {
            /*
             //close flyout navigation
             this.closeNavigationMobile();

             //close search input
             this.$columnActions.removeClass(this.classActiveSearch);

             //close login menu
             this.$columnActions.removeClass(this.classActiveLogin);
             this.$element.find('.content-tooltip-wrapper').removeAttr('style');

             //reset actions
             this.$columnActions.removeAttr('style');

             //show menu button
             this.$buttonMenu.removeClass(this.classActive);
             */

        } else {
            //close flyout navigation
            if (!this.isInitialReset) {
                this.closeNavigationFlyoutsAll();
            }

            this.$headerNavigation.removeAttr('style');

            //close search input
            if (this.isSearchOpened) {
                this.toggleSearchInput();
            }
        }

        this.isInitialReset = false;
    };

    /************************************************************
     *
     * SCROLL HANDLING
     *
     ************************************************************/

    Header.prototype.scrollHandler = function () {
        var _this = this
            , headerHeight = (this.$element.outerHeight(true) + this.headerHeightOffset)
            , headerHeightOffset = headerHeight * 3.5
            , currentScrollTop = $('body').scrollTop() || $('html').scrollTop()
            , currentScrollDirection =  'down'
            , scrollDiff = Math.abs(this.lastScrollTop - currentScrollTop)
            , scrollRelation = scrollDiff / currentScrollTop
            ;

        //clear timeout per scroll
        clearTimeout(_this.timeoutScroll);

        //check if mobile menu is opened
        if(this.$element.hasClass(this.classMobileNaviActive)) {
            return false;
        }

        //header is still animating - stop scroll handling
        if(this.isAnimatingHeader) {
            return false;
        }

        //detect scroll direction
        if(currentScrollTop < this.lastScrollTop) {
            currentScrollDirection = 'up';
        }

        //set header back to absolute
        if(currentScrollTop === 0 && !this.isAnimatingHeader) {
            log.d('make header absolute - its on top');

            this.$element
                .removeClass('fixed')
                .removeAttr('style')
            ;
        }

        //initialize scroll position and direction (after they were cleared)
        if(this.lastScrollTop === null || this.lastScrollDirection !== currentScrollDirection) {
            this.lastScrollTop = currentScrollTop;
            this.lastScrollDirection = currentScrollDirection;

            return false;
        }


        //set timeout to reset lastScrollTop to avoid incorrect calculation
        this.timeoutScroll = setTimeout(function() {
            _this.lastScrollTop = null;
        }, 70);


        //scroll down
        if(currentScrollTop > this.lastScrollTop) {
            log.d('scroll down');

            //update position of flyouts on absolute header
            this.updatePositionNavigationFlyout(this.$flyouts, currentScrollTop);

            //close flyouts
            this.closeHeaderFlyoutOnScroll();

            //animate out header
            if(this.$element.hasClass('fixed')) {
                log.d('fade out');
                
                this.isAnimatingHeader = true;
                TweenLite.to(this.$element, this.slideHeaderTime, {
                    top: (headerHeight * -1) + 'px'
                    , ease: _this.slideHeaderEaseIn
                    , onComplete: function () {
                        //make header absolute positioned
                        _this.$element.removeClass('fixed');
                        _this.$element.removeAttr('style');

                        //reset animation flag
                        _this.isAnimatingHeader = false;
                    }
                });
                this.$element.removeClass('fixed');
                showHeaderNav();
            }
        }

        //scroll up + more than header height with offset + absolute header
        if(currentScrollTop < this.lastScrollTop && currentScrollTop > headerHeightOffset && !this.$element.hasClass('fixed')) {
            //scroll too fast - no animate in header
            if(scrollRelation > this.headerRelationCheck) {
                this.lastScrollTop = currentScrollTop;
                return false;
            }

            //animate in header
            log.d('scroll up');
            log.d('set fixed');

            this.$element.addClass('fixed');
            this.isAnimatingHeader = false;

            TweenLite.set(this.$element, {
                top: (headerHeight * -1) + 'px'
            });
            TweenLite.to(this.$element, this.slideHeaderTime, {
                top: '0px'
                , ease: _this.slideHeaderEaseIn
                , onComplete: function () {
                    //reset animation flag
                    _this.isAnimatingHeader = false;
                }
            });
        }

        this.lastScrollTop = currentScrollTop;
        this.lastScrollDirection = currentScrollDirection;
    };


    Header.prototype.closeHeaderFlyout = function() {
        var _this = this;

        //slide out flyouts of header
        this.isFlyoutClosing = true;

        //remove active classes
        this.$element.find('.level-li-1').removeClass(this.classActive);

        TweenLite.to(this.$flyouts, _this.toggleDesktopTime, {
            height: 0,
            ease: _this.toggleDesktopEaseUp
            , onComplete: function() {
                _this.lastFlyoutHeight = 0;
                _this.isFlyoutClosing = false;

                //remove reference on opened flyout
                _this.$flyoutOpenedButton = null;
            }
        });
    };

    Header.prototype.closeHeaderFlyoutOnScroll = function() {
        var _this = this;

        //slide out flyouts of header
        this.isFlyoutClosing = true;

        TweenLite.to(this.$flyouts, 0, {
            height: 0
            , onComplete: function() {
                _this.lastFlyoutHeight = 0;
                _this.isFlyoutClosing = false;
            }
        });
    };




    /************************************************************
     *
     * HELPERS
     *
     ************************************************************/

    Header.prototype.setLanguageValueOnChange = function ($select, $valueTargetWrapper) {
        var value = $select.val().split(' ')[0];

        //change selected value
        $valueTargetWrapper.text(value.toUpperCase());

        //navigate to selected sub-page
        location.href = $select.find(':selected').attr('data-href');
    };

    Header.prototype.setLanguageValue = function (selectValue, $select, $valueTargetWrapper) {
        //change selected value
        $valueTargetWrapper.text(selectValue.toUpperCase());

        //change native select element
        $select.val(selectValue);
    };

    global.zo = global.zo || {};
    global.zo.autoInit = global.zo.autoInit || {};
    global.zo.autoInit.Header = HeaderModule;

})(jQuery, window);
