/****************
 * GLOABL Config
 - extend global fcbConfig from Backend
 ***************/

if(typeof fcbConfig == 'undefined') {
    fcbConfig = {};
}

if(typeof _globalPath == 'undefined') {
    _globalPath = './';
}

$.extend(
    fcbConfig, {
        fontLoader: {
            cssPaths: [
                _globalPath + 'stylesheets/main.css'
            ]
            , fontFamilies: [
                'expressway_condensed_light'
                , 'expressway_condensed_bold'
                , 'expressway_light'
                , 'expressway_bold'
            ]
        }
        , breakpoints: {
            large: 1024
            , medium: 661
            , small: 0
        }
        , breakpointKey: {
            large: 'large'
            , medium: 'medium'
            , small: 'small'
        }
        , breakpointsMax: {
            maxBreakpointXlarge: 1920
            , maxBreakpointLarge: 1366
            , maxBreakpointMedium: 1024
            , maxBreakpointSmall: 660
        }
        , dynamicLabelSettings: {
            classShowDynamicStatus: 'dynamic-show-status'
            , selectorElementKeepUpdated: 'dynamic-keep-updated'
            , selectorElementWasUpdated: 'dynamic-was-updated'
        }
    }
);
