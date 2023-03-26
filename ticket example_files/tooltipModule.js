(function ($, global) {

    var log = new zo.log();
    log.setConfig({
        'moduleName': 'Tooltip'
    });
    log.activeDebug = false;

    /* Parent Wrapper */
    var TooltipModule = function () {
        this.tooltips = [];
        this.tooltipLinkClass = 'fcb-tooltip';
        this.isTouchDevice = $('html').hasClass('touchevents');
        this.marginLeftRight = 10;

        this.closeEventDefault = 'forceClose';
        this.closeEventScroll = 'scroll';
    };

    TooltipModule.prototype.init = function () {
        var _this = this;
        
        $('.fcb-tooltip').each(function () {
            _this.tooltips.push(new Tooltip($(this), _this).init());
        });

        $(window).on('fcbResize', function () {
            for (var i = 0; i < _this.tooltips.length; i++) {
                _this.tooltips[i].destroyTooltip();
            }
        });

        $(window).on('fcbScroll', function (event) {
            //close tooltips on scroll
            _this.closeAllTooltips(_this.closeEventScroll);
        });

        $(document).not('.tooltip-select-wrapper, .fcb-tooltip, .fcb-tooltip-wrapper').on('click touchstart', function (ev) {
            var $target = $(ev.target)
                , ignoreClick = $target.closest('.tooltip-select-wrapper').length || $target.closest('.fcb-tooltip').length || $target.closest('.fcb-tooltip-wrapper').length;

            if (ignoreClick < 1) {
                _this.closeAllTooltips();
            }
        });
    };

    TooltipModule.prototype.closeAllTooltips = function (closeEvent, $excludeElement) {
        var _this = this;

        //check for excluded tooltips that should stay opened
        if (typeof $excludeElement === 'undefined' || !$excludeElement.length) {
            $excludeElement = null;
        }

        //check event type
        if (typeof closeEvent === 'undefined') {
            closeEvent = this.closeEventDefault;
        }

        $('.' + this.tooltipLinkClass).not($excludeElement).each(function () {
            if ($(this).hasClass('visible-on-scroll') && closeEvent === _this.closeEventScroll) {
                //don't close tooltip on scroll if class is set
            } else if ($(this).length && typeof $(this).data('fcbTooltip') === 'object') {
                //close all tooltips
                $(this).data('fcbTooltip').destroyTooltip();
            }
        });
    };

    /* Tooltip */
    var Tooltip = function ($element, _parent) {

        this._parent = _parent;
        this.$element = $element;
        this.isSelectbox = $element.prop('tagName') === 'SELECT';
        this.isClickable = false;
        this.ignoreDestroy = false;
        this.activeClass = 'active';
        this.clickClass = 'fcb-tooltip-click';
        this.tooltipLinkClass = this._parent.tooltipLinkClass;
        this.tooltipClass = $element.attr('data-fcb-tooltip-class') || '';
        this.disabledClass = 'fcb-tooltip-disabled';
        this.$currentTooltipHtml = null;
        this.mouseleaveTimeoutMilliseconds = 15;

    };

    Tooltip.prototype.init = function () {

        this.$element.data({
            'fcbTooltip': this
        });

        if (this.isSelectbox) {
            // this.$element.attr('disabled', true);
            this.$element.addClass('disabled');
            this.$element.attr("onclick", "javascript:return false;");
            this.$element.wrap('<div class="tooltip-select-wrapper">');

            // If the "fcb-tooltip-click" class is set and we have a select box we need to move the class to most parent container
            if (this.$element.hasClass(this.clickClass)) {
                this.$element.parent().addClass(this.clickClass);
                this.$element.removeClass(this.clickClass);
            }

            this.$element = this.$element.parent();
            this.$element.prepend('<div onclick="javascript:return false;"></div>');
        }

        if (this.$element.hasClass(this.clickClass) || this._parent.isTouchDevice) {
            this.isClickable = true;
        }

        this.bindEvents();

        return this;
    };

    /* Event handling ~ start */
    Tooltip.prototype.bindEvents = function () {
        var _this = this
            , eventListenerName = 'mouseenter'
            , mouseleaveTimeout;

        if (this.isClickable) {
            eventListenerName = 'click';
        }

        this.$element.on(eventListenerName, function (ev) {

            //check for temporary disabled tooltip function
            if (!_this.$element.hasClass(_this.disabledClass)) {
                ev.preventDefault();
                //ev.stopPropagation();

                //if( _this.$element.hasClass(_this.activeClass) && _this._parent.isTouchDevice ) {
                if (_this.$element.hasClass(_this.activeClass)) {
                    _this.destroyTooltip();
                } else {

                    var $excludeElement = $(this);

                    if (!$excludeElement.hasClass(_this.tooltipLinkClass)) {
                        $excludeElement = $excludeElement.find('.' + _this.tooltipLinkClass);
                    }

                    _this._parent.closeAllTooltips($excludeElement);

                    if (!_this.$element.hasClass(_this.activeClass)) {
                        _this.showTooltip();
                    } else if (_this.isClickable) {
                        _this.destroyTooltip();
                    }
                }

            }

        })
            .on('mouseleave', function (ev) {
                if (!_this.isClickable) {
                    mouseleaveTimeout = setTimeout(function () {
                        _this.destroyTooltip();
                    }, _this.mouseleaveTimeoutMilliseconds);
                }
            });


    };

    Tooltip.prototype.bindSelectEvents = function ($tooltipHtml) {
        var _this = this;

        $tooltipHtml.find('a').on('click', function (ev) {
            ev.preventDefault();

            var $select = _this.$element.find('select');
            $select.val($select.find('option').eq($(this).attr('data-option-index')).val());
            $select.trigger('change');

            _this.ignoreDestroy = false;
            _this.destroyTooltip();
        });
    };
    /* Event handling ~ end */

    /* Hide / Show ~ start */
    Tooltip.prototype.showTooltip = function () {
        if (this.$currentTooltipHtml != null) {
            return;
        }

        var _this = this
            , windowWidth = zo.innerSize().width
            , windowHeight = zo.innerSize().height
            , $html = $(this.buildHtml())
            , left = this.$element.offset().left - this._parent.marginLeftRight
            , right = windowWidth - (this.$element.offset().left + this.$element.outerWidth(true))
            , $closestLayoutContainer = this.$element.closest('.fcb-container')
            , rightContent = 0
            , top = this.$element.offset().top + this.$element.height()
            , isRightAlign = this.$element.hasClass('right-align')
            , isContentAlign = this.$element.hasClass('content-align')
        ;

        // calc right aligned
        if($closestLayoutContainer.length) {
            rightContent = $closestLayoutContainer.offset().left + parseInt($closestLayoutContainer.css('padding-right').replace('px', ''))
        }

        if (this.isSelectbox) {
            left = this.$element.find('> div:first').offset().left - this._parent.marginLeftRight;
        }

        var styleObject = {};
        styleObject['top'] = top;
        if (isRightAlign) {
            styleObject['right'] = right;
        } else if (isContentAlign) {
            log.d('### conti align');
            styleObject['right'] = rightContent;
        } else {
            styleObject['left'] = left;
        }

        this.$element.addClass(this.activeClass);

        $html.css(styleObject);

        this.$currentTooltipHtml = $html;
        $('body').append($html);

        // check width
        var width = $html.outerWidth(true)
            , leftAndWidth = left + width + this._parent.marginLeftRight; // at least we need 10px margin

        if (leftAndWidth > windowWidth && (!isRightAlign && !isContentAlign)) {
            var diffValue = (leftAndWidth - windowWidth)
                , cssConfig = {};

            cssConfig.left = left - diffValue;

            if (cssConfig.left < 0) {
                diffValue += cssConfig.left;
                cssConfig.left = 0;
                cssConfig.right = 0;
                cssConfig.minWidth = 'auto';
            }

            $html.css(cssConfig);

            $html.find('.tooltip-content-arrow').css({
                left: '+=' + diffValue
            });
        }

        if (isRightAlign || isContentAlign) {
            $html.find('.tooltip-content-arrow').css({
                right: '30px'
                , left: 'auto'
            });
        }

        // check height
        var elmentHeight = this.$element.outerHeight()
            , tooltipAndElementHeight = $html.outerHeight(true) + elmentHeight
            ;

        if (tooltipAndElementHeight > windowHeight) {
            var tooltipTargetHeight = windowHeight - elmentHeight;

            $html.find('.tooltip-content').css({
                'max-height': tooltipTargetHeight
                , 'overflow-y': 'scroll'
            });
        }

        // Only for hoverble tooltips
        if (!_this.isClickable) {
            $html.on('mouseenter', function (ev) {
                _this.ignoreDestroy = true;
            })
                .on('mouseleave', function (ev) {
                    _this.ignoreDestroy = false;
                    _this.destroyTooltip();
                });
        }

        // Check on touch devices if we need to scroll the view to see the tooltip
        if (this._parent.isTouchDevice || this.isClickable) {
            var tooltipEndpoint = top + $html.outerHeight(true)
                , currentScrollTop = $(window).scrollTop()
                , visibleWindowEndpoint = currentScrollTop + windowHeight
                ;

            if (visibleWindowEndpoint < tooltipEndpoint) {
                var targetYValue = tooltipEndpoint - windowHeight + this._parent.marginLeftRight;

                TweenLite.to(window, 0.6, {
                    scrollTo: {
                        y: targetYValue
                        , x: 0
                    }
                    , ease: Power2.easeInOut
                });
            }
        }

        if (this.isSelectbox) {
            this.bindSelectEvents($html);
        }
    };

    Tooltip.prototype.destroyTooltip = function () {
        if (this.$currentTooltipHtml === null || this.ignoreDestroy === true) {
            return;
        }
        this.$currentTooltipHtml.remove();
        this.$currentTooltipHtml = null;
        this.$element.removeClass(this.activeClass);
    };

    /* Hide / Show ~ end */

    /* HTML creation ~ start */
    Tooltip.prototype.buildHtml = function () {
        var html = []
            , tempHtml
            ;

        // Check if we have to build the tooltip based on the Select-options
        if (this.isSelectbox) {
            tempHtml = this.buildHtmlBasedOnSelectbox();
        } else {
            tempHtml = $(this.$element.attr('data-fcb-tooltip')).html();

            if (!tempHtml) {
                tempHtml = '!Tooltip content not found!';
            }
        }

        html.push('<div class="fcb-tooltip-wrapper ' + this.tooltipClass + '">');
        html.push('<div class="tooltip-content-arrow"></div>');
        html.push('<div class="tooltip-content">');
        html.push(tempHtml);
        html.push('</div>');
        html.push('</div>');

        return html.join('');
    };

    Tooltip.prototype.buildHtmlBasedOnSelectbox = function () {
        var html = [];
        html.push('<ul>');

        this.$element.find('option').each(function () {

            var activeClass = $(this).is(':selected') ? ' class="active"' : '';

            html.push('<li' + activeClass + '>');
            html.push('<a href="#" data-option-index="' + $(this).index() + '">');
            html.push($.trim($(this).text()));
            html.push('</a>');
            html.push('</li>');
        });

        html.push('</ul>');

        return html.join('');
    };
    /* HTML creation ~ end */

    global.zo = global.zo || {};
    global.zo.autoInit = global.zo.autoInit || {};
    global.zo.autoInit.Tooltip = TooltipModule;

})(jQuery, window);
