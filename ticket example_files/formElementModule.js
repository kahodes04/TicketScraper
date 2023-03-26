(function ($, global) {
    // LOG CUSTOM MESSAGE
    var log = new zo.log();
    log.setConfig({
        'moduleName': 'FormElementModule'
        , 'moduleBackgroundColor': '#CC66FF'
    });
    log.activeDebug = false;

    var FormElementModule = function () {
        log.d('init module');
        this.selector = '.fcb-form-input';
        this.formElements = [];
    };

    FormElementModule.prototype.init = function () {
        var _this = this;

        $(this.selector).each(function (index, el) {
            var formElement = new FcbFormElement(el, index);
            formElement.init();
            _this.formElements.push(formElement);
        });

        this.buttonError();

    };

    FormElementModule.prototype.getIstanceByDomElement = function ($inputElement) {
        var _this = this
            , target;

        $.each(_this.formElements, function (index, _formElement) {

            if (_formElement.$element.get(0) === $inputElement.get(0)) {
                log.d(_formElement.$element, '_formElement.$element')
                target = _formElement;
                return;
            }
        });
        return target;
    };

    FormElementModule.prototype.getIstanceById = function (id, elementOption) {

        var result = $.grep(this.formElements, function (e) {
            return e.id == id;
        });

        if (result.length > 1) {
            log.e('id should be unique!');

            return false;

        } else if (result.length === 0) {
            log.e('id not defined!');

            return false;

        } else {
            return result[0];
        }
    };

    FormElementModule.prototype.getIstanceByIndex = function (index, elementOp) {
        var result = $.grep(this.formElements, function (e) {
            return e.index == index;
        });

        return result[0];
    };

    FormElementModule.prototype.buttonError = function () {

        $('.fcb-button-error').on('click', function (e) {

            e.preventDefault();

            var id = $(this).attr('href');

            var target = zo.autoInit.FormElementModule.getIstanceById(id);

            if (target.state === "error") {
                target.clearError();
                $(this).text('trigger error');

            } else if (target.state === "inactive") {

                $(this).text("can't trigger error on inactive input!");

            } else {
                target.onError();
                $(this).text('clear error');
            }
            ;

        });
    };

    // FcbFormElement Class
    FcbFormElement = function (element, index) {
        this.$element = $(element);
        this.$wrapper = $(element).parent();
        this.$label = this.$wrapper.parent().find('label');
        this.index = index;
        this.id = this.$element.attr('id');
        this.cssPrefix = 'fcb-input-event-';
        this.type = this.$element.attr('type') || "no-input-field";
        this.innerLabel = this.$element.data('innerLabel') || false;

        if (this.$element.hasClass('inactive')) {
            this.state = "inactive";
            this.$wrapper.addClass('inactive');
        } else {
            this.state = "normal";
        }

        if (this.type === "no-input-field") {
            var select = this.$wrapper.find('select').length;
            var textarea = this.$wrapper.find('textarea').length;

            select === 1 ? this.type = "select" : false;
            textarea === 1 ? this.type = "textarea" : false;

        }

        this.$element.data('FcbFormElement', this);
    };

    FcbFormElement.prototype.init = function () {
        this.bindEvents();

        if (this.type === "password") {
            this.passwordMode();
        }

        if (this.type === "select") {
            this.selectMode();
        }

        if (this.innerLabel) {
            this.innerLabelMode();
        }

        if (this.type === "datepicker") {
            this.datePickerMode();
        }

    };

    FcbFormElement.prototype.bindEvents = function () {
        this.onFocus();
        this.onHover();
    };

    /* GENERAL EVENTS
     _______________________________________________________ */

    FcbFormElement.prototype.onHover = function () {

        var _this = this;

        this.$element.on('mouseenter', function () {
            $(this).addClass(_this.cssPrefix + 'hover');
            //log.d('mouseenter', this);
        });

        this.$element.on('mouseleave', function () {
            $(this).removeClass(_this.cssPrefix + 'hover');
            //log.d('mouseleave', this);
        });

    };

    FcbFormElement.prototype.onFocus = function () {

        var _this = this;

        this.$element.on('focus', function () {
            _this.$wrapper.addClass(_this.cssPrefix + 'focus');
            _this.$wrapper.find('.ui-datepicker-trigger').addClass('wrapper-focus');
        });

        this.$element.on('focusout', function () {
            _this.$wrapper.removeClass(_this.cssPrefix + 'focus');
            _this.$wrapper.find('.ui-datepicker-trigger').removeClass('wrapper-focus');
        });
    };

    FcbFormElement.prototype.onError = function () {

        if (this.state != "inactive") {
            var data = this.$element.data('error');
            this.$wrapper.addClass('error');
            this.$wrapper.parent().addClass('error');
            this.state = "error";

            if (data) {
                this.$wrapper.after('<div class="fcb-form-error">' + data + '</div>');
            }
        }

    };

    FcbFormElement.prototype.clearError = function () {
        this.$wrapper.removeClass('error');
        this.$wrapper.parent().removeClass('error');
        this.$wrapper.parent().find('.fcb-form-error').remove();
        this.state = "normal";
    };

    FcbFormElement.prototype.innerLabelMode = function () {

        var _this = this;
        var labelText = _this.$label.text();
        var paddingOffset = 5;

        var fontLoaded = false;

        $(window).on('fcbGrid', function (e, data) {

            if (data.breakpoint == "small") {
                init();
            } else {
                _this.$label.removeClass('inner');
                _this.$label.text(labelText.replace(' / ', ""));
                _this.$element.css('padding-left', "");
            }

            function init() {

                _this.$label.addClass('inner');
                _this.$label.text(labelText + " / ");

                if (fontLoaded) {
                    _this.$element.css('padding-left', _this.$label.width() + paddingOffset);
                } else {
                    $(window).on('webFontsActive', function () {
                        _this.$element.css('padding-left', _this.$label.width() + paddingOffset);
                        fontLoaded = true;
                    });
                }
                ;

            }

        });

    };

    FcbFormElement.prototype.selectMode = function () {
        var _this = this;

        var placeholder = _this.$element.data('placeholder');

        var padding = _this.$wrapper.css('padding');

        _this.$wrapper.css('padding', 0);

        if (placeholder) {

            $("#" + this.id).select2({
                placeholder: placeholder
                , minimumResultsForSearch: Infinity
                , dropdownAutoWidth: true
            });

        } else {

            $("#" + this.id).select2({
                minimumResultsForSearch: Infinity
            });

        }

        $("#" + this.id).on('select2:open', function (e, a) {


            var target = this;
            var selectData = $(this).data('select2');

            setHeight();

            function setHeight() {

                var select = selectData.$dropdown;
                var optionBox = select.find('.select2-results__options');

                var topPosition = $(target).offset().top - $(window).scrollTop();
                var availableHeight = window.innerHeight - topPosition;

                optionBox.css({
                    maxHeight: availableHeight - 80
                });

            }

            $(window).on('scroll.selectBoxHeight', function () {
                setHeight();
            })

        });

        $("#" + this.id).on('select2:close', function (e, a) {
            $(window).off('scroll.selectBoxHeight');
        });


    };

    FcbFormElement.prototype.updateSelect = function (data) {
        var _this = this;

        var placeholder = _this.$element.data('placeholder');
        var padding = _this.$wrapper.css('padding');

        _this.$wrapper.css('padding', 0);

        if (placeholder) {

            $("#" + this.id).find('option').not(':first-child').remove();

            $("#" + this.id).select2({
                placeholder: placeholder
                , minimumResultsForSearch: Infinity
                , data: data
            });


        } else {

            $("#" + this.id).find('option').not(':first-child').remove();

            $("#" + this.id).select2({
                minimumResultsForSearch: Infinity
                , data: data
            });

        }

        // add correct icon
        this.$wrapper.find('.select2-selection__arrow').addClass('icon-line-arrow-down');


    };

    FcbFormElement.prototype.datePickerMode = function () {

        var _this = this;
        var _table = null;

        if (Modernizr.touchevents) {
            mobileInit();
        } else {
            desktopInit();
        }

        function desktopInit() {

            _this.$element.datepicker({
                showOn: "button",
                showButtonPanel: false
                //, buttonImage: _globalPath + "images/datepicker_icon.png"
                , firstDay: 1 // set Monday as first day
                , showOtherMonths: true
                , changeMonth: true
                , changeYear: true
                , monthNamesShort: fcbConfig.datepicker.monthNames
                , beforeShow: function (input, obj) {
                    initSelect2(obj);
                    _this.$wrapper.addClass('datepicker-opened');
                }
                , onChangeMonthYear: function (year, month, obj) {
                    initSelect2(obj);
                },
                onClose: function () {
                    _this.$wrapper.removeClass('datepicker-opened');
                }

            });

            var config = {};
            if(_this.$element.hasClass('is-birthday')) {
                $.extend(config, fcbConfig.datepicker, fcbConfig.datepickerBirthday);
            } else {
                config = fcbConfig.datepicker;
            }

            $(_this.$element).datepicker("option", config);

            $(_this.$element).datepicker("option", {
                monthNamesShort: fcbConfig.datepicker.monthNames
            });

            _this.datepickerTrigger = _this.$element.parent().find('.ui-datepicker-trigger');

            function initSelect2(obj) {

                setTimeout(function () {
                    var _table = obj.dpDiv[0];
                    var select = $(_table).find('select');
                    $.each(select, function (index, el) {
                        drawSelect(this, _table);
                    });

                    $(_table).find('.select2-selection__arrow').addClass('icon-line-arrow-down');
                });
            }

            function drawSelect(el, _table) {

                $(el).select2({
                    minimumResultsForSearch: Infinity
                    //, containerCssClass : "select-datepicker"
                });
                /* workaround to fix init behaviour of select2 */
                $(el).select2("open");
                $(el).select2("close");

                $(el).on('select2:open', function () {

                    var selectData = $(this).data('select2');
                    var select = selectData.$dropdown.addClass('range-picker');
                    var optionBox = select.find('.select2-results__options');
                    var isMonth = selectData.$element.hasClass('ui-datepicker-month');

                    if (isMonth) {
                        select.addClass('month-selector');

                    } else {
                        select.addClass('year-selector');
                    }

                    setHeight();

                    function setHeight() {

                        var topPosition = $(select).offset().top - $(window).scrollTop();
                        var availableHeight = window.innerHeight - topPosition;
                        optionBox.css({
                            maxHeight: availableHeight - 20
                        });
                    }

                    $(window).on('scroll.selectBoxHeight', function () {
                        setHeight();
                    })

                })

            }

            //ovverride content "..." by jquery datepicker
            $(_this.$wrapper).find('.ui-datepicker-trigger').text("");

            //set correct icon
            $(_this.$wrapper).find('.ui-datepicker-trigger').addClass('icon-font-calendar');

            // hide datepicker on keydown event
            $(_this.$element).on('keydown', function () {
                _this.$element.datepicker('hide');
            });

            $(_this.$element).on('focus', function () {

                if (_this.$wrapper.hasClass('error')) {
                    var instance = $(this).data('FcbFormElement');
                    instance.clearError();
                    $(this).val('');
                }
            });

            $(_this.$element).on('focusout', function () {
                var value = $(this).val();

                if (value !== null && typeof value !== "undefined" && value !== "") {
                    _this.checkDateError(value, this);
                }
            });

            // _this.datepickerTrigger.on('click',function(){
            //     _this.$wrapper.addClass('datepicker-opened');
            // });

        }

        function mobileInit() {
            //transform input from text to date type on touch devices
            $(_this.$element).attr('type', "date");
        };

    };

    FcbFormElement.prototype.checkDateError = function (stringValue, input) {

        var _this = this;

        try {
            var inputValue = $.datepicker.parseDate(fcbConfig.datepicker.dateFormat, stringValue);

        } catch (e) {

            // ERROR
            log.e(e);
            var instance = $(input).data('FcbFormElement');
            instance.onError();

            _this.$element.find('.fcb-form-error').on('click', function () {
                $(this).fadeOut();
                instance.clearError();
                $(input).val('');
            });

        }

    };

    /* PASSWORD MODE
     ______________________________________ */

    FcbFormElement.prototype.passwordMode = function () {
        var _this = this;
        var hiddenString = null;
        var $button = _this.$wrapper.find('.show-password');
        var $fakeInput = _this.$element.clone();
        var hideLabel = $button.data('passwordLabel');
        var showLabel = $button.text();
        var showPasswordState = false;

        setDimension();
        $(window).on('fcbResize', function () {
            setDimension();
        });

        _this.$element.after($fakeInput);
        $fakeInput.attr('type', 'text').hide();

        // hide element setting opacity 0
        $button.parent().css("opacity", 0);

        bindEvents();

        function bindEvents() {

            _this.$element.on('keyup', function () {
                updateValue(this);
            });

            $fakeInput.on('keyup', function () {
                updateValue(this);
            });

            $button.on('click', function (e) {
                e.preventDefault();

                if (showPasswordState) {
                    hidePassword();
                } else {
                    showPassword();
                }

            });
        }

        function updateValue(target) {
            hiddenString = $(target).val();
            $fakeInput.val(hiddenString);
            _this.$element.val(hiddenString);

            if (hiddenString == "") {
                $button.parent().stop(true, false).animate({
                    opacity: 0
                });
            } else {
                $button.parent().stop(true, false).animate({
                    opacity: 1
                });
            }
        }

        function showPassword() {

            _this.$element.hide();
            $fakeInput.show();

            $button.text(hideLabel);

            showPasswordState = true;

        }

        function hidePassword() {

            $fakeInput.hide();
            _this.$element.show();

            $button.text(showLabel);

            showPasswordState = false;
        }

        function setDimension() {
            var inputWrapper = _this.$wrapper.width();
            var inputWidth = _this.$element.width();
            var buttonWidth = $button.parent().width();

            _this.$element.width(inputWrapper - buttonWidth - 40);
            $fakeInput.width(inputWrapper - buttonWidth - 40);
        };

    };

    FcbFormElement.prototype.active = function () {

        var _this = this;
        this.$element.removeAttr('disabled');
        this.$wrapper.removeClass('inactive');
        this.state = "normal";

    }

    global.zo = global.zo || {};
    global.zo.autoInit = global.zo.autoInit || {};
    global.zo.autoInit.FormElementModule = FormElementModule;
    //global.zo.autoInit.FormElementModule.FcbFormElement = FcbFormElement;

})(jQuery, window);
