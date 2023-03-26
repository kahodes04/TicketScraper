// Define global ZO
window.zo = window.zo || {};

/* Log Wrapper ~ START */
window.zo.log = (function() {
	function log(_config) {
		this.activeDebug = false;
		this.defaultModuleName = '### MODULE NOT SET ###';
		this.defaultConfig = {
			'moduleName': this.defaultModuleName
			, 'moduleBackgroundColor': '#FFE600'
			, 'moduleTextColor': '#000000'
		};

		if(_config) {
			this.setConfig(_config);
		}
	};

	log.prototype.setConfig = function(_config) {
		for(var i in _config){
			this.defaultConfig[i] = _config[i];
		}
	};

	log.prototype.log = function(_config, _arguments) {

		if(_config.moduleName === this.defaultModuleName) {
			_config = JSON.parse(JSON.stringify(_config));;
			_config.moduleBackgroundColor = "-moz-linear-gradient( left,rgba(255, 0, 0, 1) 0%,rgba(255, 255, 0, 1) 15%,rgba(0, 255, 0, 1) 30%,rgba(0, 255, 255, 1) 50%,rgba(0, 0, 255, 1) 65%,rgba(255, 0, 255, 1) 80%,rgba(255, 0, 0, 1) 100%);background: -webkit-gradient(linear,  left center, right center, color-stop(0%, rgba(255, 0, 0, 1)), color-stop(15%, rgba(255, 255, 0, 1)),color-stop(30%, rgba(0, 255, 0, 1)),color-stop(50%, rgba(0, 255, 255, 1)),color-stop(65%, rgba(0, 0, 255, 1)),color-stop(80%, rgba(255, 0, 255, 1)),color-stop(100%, rgba(255, 0, 0, 1)));";
			_config.moduleTextColor = '#000000';
		}

		var args = [];
		args.push('%cModule: ' + _config.moduleName);
		args.push('background: ' + _config.moduleBackgroundColor + '; color: ' + _config.moduleTextColor + '; padding: 3px 6px; font-weight: bold;');

		for(var i = 0; i < _arguments.length; i++) {
			args.push(_arguments[i]);
		}

		if((_arguments.length && location.hostname === 'localhost') || this.activeDebug) {
			console.log.apply(console, args);
		}
	};

	log.prototype.d = function() {
		this.log(this.defaultConfig, arguments);
	};

	log.prototype.e = function() {
		var _c = JSON.parse(JSON.stringify(this.defaultConfig));
		_c.moduleBackgroundColor = '#ff0000';
		_c.moduleTextColor = '#ffffff';

		this.log(_c, arguments);
	};

	log.prototype.i = function() {
		var _c = JSON.parse(JSON.stringify(this.defaultConfig));
		_c.moduleBackgroundColor = '#0066ff';
		_c.moduleTextColor = '#ffffff';

		this.log(_c, arguments);
	};

	// return new log();
	return log;
})();
/* Log Wrapper ~ END */

//polyfill for IE
Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" &&
        isFinite(value) &&
        Math.floor(value) === value;
};

// You can now use between like this: numberVariable.between(0, 100)
Number.prototype.between = function(a, b) {
	var min = Math.min.apply(Math, [a, b])
        , max = Math.max.apply(Math, [a, b]);

	return this > min && this < max;
};

/* === define console.log for the browser which can`t handle it === */
/*
if(typeof console == "undefined") {
	var console = {};
	console.log = function(){};
	window.console = console;
}
*/

/* === function that returns the current IE version number === */
var ie = (function(){
    //works just till IE 9
	var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');

		while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
    );

	return v > 4 ? v : undef;
}());


zo.detectIE = function() {
    var ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …
    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
};

zo.initDetectIE = function() {
    var ieVersion = zo.detectIE();

    if (ieVersion !== false) {
        var htmlElement = document.getElementsByTagName('html')[0];
        htmlElement.classList.add('ie');
        htmlElement.classList.add('ie-' + ieVersion);
    }
};

zo.initDetectIE();


/* === grab the correct inner size without scrollbar - var innerWidth = zo.innerSize().width; ===*/
zo.innerSize = function() {
	var v = window;
	var a = 'inner';

	if (!('innerWidth' in v)) {
		a = 'client';
		v = document.documentElement || document.body;
	}

	return {
		width: v[ a + 'Width' ]
		, height: v[ a + 'Height' ]
	};
};

/* === parse url parameters from hash === */
zo.getUrlParameter = function(val) {
	var result = null,
		tmp = [];

	var items = location.hash.substr(1).split("&");

	for(var index = 0; index < items.length; index++) {
		tmp = items[index].split("=");
		if (tmp[0] === val) result = decodeURIComponent(tmp[1]);
	}
	return result;
};

zo.getUrlParameters = function() {
	var result = {},
		tmp = [];

	var items = location.hash.substr(1).split("&");

	for(var index = 0; index < items.length; index++) {
		tmp = items[index].split("=");
		result[tmp[0]] = decodeURIComponent(tmp[1]);
	}
	return result;
};

zo.debounce = function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

/* === Extend the Date object for current timestamp === */
Date.now = Date.now || function() { return new Date; };

/* === Extend Array object with method max === */
Array.max = function( array ){
	return Math.max.apply( Math, array );
};

/* === get object size === */

Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

/* === Formats string as follows ~ "Bearbeite {0} von {1}".format(7, 9) === */
if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;

		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
		});
	};
}


/* === COOKIES === */
zo.getCookie = function(cookie) {
    var cookieName = cookie + "=";
    var cookies = document.cookie.split(';');

    //loop over all cookies
    for(var i = 0; i < cookies.length; i++) {
        var cookieData = cookies[i];

        while(cookieData.charAt(0) == ' ') {
            cookieData = cookieData.substring(1);
        }

        if(cookieData.indexOf(cookieName) == 0) {
            return cookieData.substring(cookieName.length, cookieData.length);

        }
    }
    return "";
};

zo.writeCookie = function(cookie, value, expDays) {
    var expDate = new Date()
        , cookieExpires = ''
        , cookieContent = cookie + "=" + value + ";"
    ;

    if(expDays > 0) {
        expDate.setTime(expDate.getTime() + (expDays * 24*60*60*1000));
        cookieExpires = ' expires=' + expDate.toUTCString();
    }

    document.cookie = cookieContent + cookieExpires;
};


/* === SIMPLE ID === */
zo.getSimpleId = function(prefix) {
    var id = '',
        idPrefix = prefix || ''
    ;

    for(var i = 0; i < 3; i++) {
        id += parseInt(Math.random(1, 10) * 100);
    }

    return idPrefix + id;
};

/* === DATE FUNCTIONS === */
zo.getDateEndOfDay = function(dateSource) {
	dateSource.setHours(23, 59, 59, 999);

	//return given date object at end of day
	return dateSource;
};

zo.getDateStartOfDay = function(dateSource) {
	dateSource.setHours(0, 0, 0, 0);

	//return given date object at end of day
	return dateSource;
};

zo.testDate = function(dateValue) {
	if(typeof dateValue === 'undefined') {
		dateValue = '2016-02-17T15:00:00.397+00:00';
	}

	var testDate = new Date(dateValue);
	var output = testDate.toLocaleString() + '<br>' + testDate.toLocaleDateString() + '<br>' + testDate.toLocaleTimeString();

	//console.log(output);
	//console.log('>>> date', zo.getFormattedDate(testDate));
	//console.log('>>> time', zo.getFormattedTime(testDate));
	alert(testDate.toLocaleDateString() + ' # ' + testDate.toLocaleTimeString());
	//alert(zo.getFormattedDate(testDate) + ' ' + zo.getFormattedTime(testDate));
};

zo.getFormattedDate = function(dateSource) {
	//returns formatted time based on timezone of browser client
	//var test = dateSource.toLocaleDateString();

	return jQuery.datepicker.formatDate(fcbConfig.datepicker.dateFormat, dateSource);
};

zo.getFormattedDateNoYear = function(dateSource) {
    //returns formatted time based on timezone of browser client
    //var test = dateSource.toLocaleDateString();

    return jQuery.datepicker.formatDate(fcbConfig.datepicker.dateFormatNoYear, dateSource);
};

zo.getFormattedTime = function(dateSource, disableClockText) {
	//returns formatted time based on timezone of browser client
	var outputTime = dateSource.toLocaleTimeString()
		, lastIndex = 0
		, firstIndex = 0
        , disableText = disableClockText || false
	;

	//cut seconds from time
	if((outputTime.match(/:/g) || []).length === 2) {
		lastIndex = outputTime.lastIndexOf(':');
		//outputTime = outputTime.substring(0, lastIndex) + outputTime.substring(lastIndex + 3, outputTime.length);
        outputTime = outputTime.substring(0, lastIndex);
	}

	//cut additional infos
	firstIndex = outputTime.indexOf(' ');
	if(firstIndex !== -1) {
		outputTime = outputTime.substring(0, firstIndex);
	}

    if(disableText) {
        return outputTime;
    }

	return outputTime + ' ' + fcbConfig.dynamicLabels.outputTimeText;
};

zo.getTimeDifference = function(dateCheck, dateCurrent, paramTimeFormat) {
	//difference between specified date and current date
	var timeFormat = (1000 * 60) //default: minutes
	;

	if(dateCurrent === null) {
		dateCurrent = new Date();
	}

	if(typeof paramTimeFormat !== 'undefined') {
		timeFormat = paramTimeFormat;
	}

	return Math.floor((dateCurrent - dateCheck) / timeFormat);
};

// http://stackoverflow.com/a/15289883
zo.dateDiffInDays = function(a, b) {
	var _MS_PER_DAY = 1000 * 60 * 60 * 24;
	// Discard the time and time-zone information.
	var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
	var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

	return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

zo.showDynamicLabels = function($elements) {
	var i = 0;

	for(i = 0; i < $elements.length; i++) {
		zo.showDynamicDateLabels(jQuery($elements[i]));
	}
};
zo.showDynamicDateLabels = function($element) {

	//get attribute with date information of element
	var valueDatePublished = $element.attr('data-date-publication')
		, valueDateModified = $element.attr('data-date-modification')
		, timeDifference = 0
		, dateCurrent = null
		, datePublished = null
		, dateModified = null
		, outputTimeDifference = ''
		, outputStatus = ''
		, flagShowStatus = false
		, outputDate = ''
		, outputTime = ''
	;

	if(typeof valueDatePublished === 'undefined' || typeof valueDateModified === 'undefined') {
		return false;
	}

	//calculate and check time difference
	datePublished = new Date(valueDatePublished);
	dateModified = new Date(valueDateModified);
	dateCurrent = new Date();

	//timedifference between current date and created date
	timeDifference = zo.getTimeDifference(datePublished, dateCurrent);

	if(timeDifference >= 0 && timeDifference < fcbConfig.dynamicLabels.checkTimeDifference) {
		//LABEL: NEW
		//current date - created date < 60
		flagShowStatus = true;
		outputStatus = fcbConfig.dynamicLabels.outputStatusNew;

	} else {
		//timedifference between modification date and current date
		timeDifference = zo.getTimeDifference(dateModified, dateCurrent);

		if(timeDifference >= 0 && timeDifference < fcbConfig.dynamicLabels.checkTimeDifference) {
			//LABEL: UPDATED
			//modification date < current client date + 60
			flagShowStatus = true;
			outputStatus = fcbConfig.dynamicLabels.outputStatusUpdated;

		} else {
			//LABEL: NONE
			flagShowStatus = false;
		}
	}

	if(flagShowStatus) {
		//show time offset
		if(timeDifference === 0) {
			outputTimeDifference = fcbConfig.dynamicLabels.outputTimeDifferenceNow;
		} else {
			outputTimeDifference = fcbConfig.dynamicLabels.outputTimeDifference.replace('#', timeDifference);
		}

		$element.find('.dynamic-label.type-timeoffset').text(outputTimeDifference).show();
		$element.find('.dynamic-label.type-date').hide();
		$element.find('.dynamic-label.type-time').hide();
		$element.find('.dynamic-label.type-time-prefix').hide();
		$element.find('.dynamic-label.type-status').text(outputStatus);

		//show dynamic label for status
		$element.addClass(fcbConfig.dynamicLabelSettings.classShowDynamicStatus);

		//enable dynamic label updates
		$element.addClass(fcbConfig.dynamicLabelSettings.selectorElementKeepUpdated);

	} else {
        //display publication date
        outputDate = zo.getFormattedDate(datePublished);
        outputTime = zo.getFormattedTime(datePublished);

		//show time and date label
		$element.find('.dynamic-label.type-timeoffset').hide();
		$element.find('.dynamic-label.type-date').text(outputDate).show();
		$element.find('.dynamic-label.type-time').text(outputTime).show();
		$element.find('.dynamic-label.type-time-prefix').show();

		//hide dynamic label for status
		//$element.find('.dynamic-label.type-status').hide();
		$element.removeClass(fcbConfig.dynamicLabelSettings.classShowDynamicStatus);

		//disable dynamic label updates
		$element.removeClass(fcbConfig.dynamicLabelSettings.selectorElementKeepUpdated);
		$element.addClass(fcbConfig.dynamicLabelSettings.selectorElementWasUpdated);
	}
};


/* === HASH FUNCTIONS === */
zo.parseUrlHash = function() {
	var locationHash = window.location.hash
		, paramsUrl = []
		, paramsExtracted = []
		, paramString = ''
		, paramKey = ''
		, paramValue = ''
	;

	//replace hash
	locationHash = locationHash.replace('#', '');

	//check for encoded url
	if(locationHash.indexOf('%') > 0) {
		locationHash = decodeURIComponent(locationHash);
	}

	//extract parameters
	if(locationHash.indexOf('&') > 0) {
		paramsHash = locationHash.split('&');
	} else {
		paramsHash = [locationHash];
	}

	//extract parameter values
	for(var i = 0; i < paramsHash.length; i++) {
		paramString = paramsHash[i].split('=');
		paramKey = paramString[0] || paramString;
		paramValue = paramString[1] || '';

		if(paramKey !== '') {
			//check for array
			if(paramValue.indexOf(',') > 0) {
				paramValue = paramValue.split(',');
			}

			paramsExtracted[paramKey] = paramValue;
		}
	}

	return paramsExtracted;
};

zo.updateUrlHash = function(paramsHash) {
	var paramsString = ''
		, paramCount = 0
		, paramSeparator = ''
		, paramValue = null
	;

	for(var key in paramsHash) {
		if(paramsHash.hasOwnProperty(key)) {
			paramValue = paramsHash[key];

			if(zo.checkIsArray(paramValue)) {
				//handle param array
				paramValue = paramValue.join(',');
			}

			paramsString += paramSeparator + key + '=' + paramValue;
			paramSeparator = '&';
		}
	}

	window.location.hash = paramsString;
};


/* === VALIDATE FUNCTIONS === */
zo.checkIsArray = function(obj) {
	// Use compiler's own isArray when available
	if(Array.isArray) {
		return Array.isArray(obj);
	}

	//use fallback
	return Object.prototype.toString.call(obj) == "[object Array]";
};

zo.checkIsValidDate = function(obj) {
	if(Object.prototype.toString.call(obj) === "[object Date]") {
		//is date
		if(isNaN(obj.getTime())) {
			//date invalid
			return false;
		} else {
			//date is valid
			return true;
		}
	}

	return false;
};


/* === GET CURRENT BREAKPOINT === */
zo.getBreakpoint = function() {
	var windowWidth = zo.innerSize().width;

	for(var key in fcbConfig.breakpoints) {
		if(windowWidth >= parseInt(fcbConfig.breakpoints[key])) {
			return {
				'breakpoint': key
				, 'breakpointWidth': fcbConfig.breakpoints[key]
			};
		}
	}
};

zo.injectSVG = function($imageReference, scaleByHeight) {
    var pathSVG = $imageReference.attr('src')
        , $svgWrapper = null
        , imageClasses = ''
        , wrapperClasses = 'icon'
        , $svg = null
        , scaleHeight = scaleByHeight || false
        ;

    jQuery.get(pathSVG, function(data) {
        //create wrapper for svg
        imageClasses = $imageReference.attr('class');

        if(typeof imageClasses !== 'undefined') {
            wrapperClasses += ' ' + imageClasses;
        }

        $svgWrapper = jQuery('<span class="' + wrapperClasses  + '"></span>');

        //get content of svg image
        $svg = jQuery(data).find('svg');

        //remove any invalid XML tags as per http://validator.w3.org
        $svg.removeAttr('xmlns:a');
        $svg.attr('preserveAspectRatio', 'xMinYMin');

        //remove ids and classes
        $svg.find('path').removeAttr('id').removeAttr('class');

        //check if the viewport is set, otherwise create
        if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
            $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'));
        }

        /*
        if(scaleHeight) {
            $svg.attr('width', 'auto');
            $svg.attr('height', '100%');
        }
        */

        //remove tags in svg
        $svg.find('defs').remove();

        //wrap svg with span
        $svgWrapper.append($svg);

        //replace image with new SVG
        $imageReference.replaceWith($svgWrapper);
    }, 'xml');
};


/* === GENERAL FUNCTIONS === */

// get random int by range
Math.randomIntByRange = function(min, max){
	return Math.floor( Math.random() * (max - min + 1)) + min;
};

Array.min = function( array ){
	return Math.min.apply( Math, array );
};

