(function(root, factory) {
    // Universal Module Definition
    if (typeof define === 'function' && define.amd) {
        define(['underscore'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(require('underscore'));
    } else {
        root.Trans = factory(root._);
    }
}(this, function(_) {

    'use strict';


    // shortcuts and feature tests
    var w = window;
    var doc = document;
    var slice = Array.prototype.slice;
    var transitionsFeatureTest = function() {
        var s = document.createElement('p').style;
        return !! ('transition' in s || 'WebkitTransition' in s ||
            'MozTransition' in s || 'msTransition' in s || 'OTransition' in s);
    }
    var transitionEndEvent = (function() {
        var t;
        var el = document.createElement('div');
        var transitions = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'otransitionend',
            transition: 'transitionend'
        }

        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    })();



    // utils
    var u = {
        noop: function(){},
        slice: function(args) {
            return slice.apply(args, slice.call(arguments, 1));
        },
        splitCommasOutside: function(str) {
            return str.split(/(?:,+\s)(?=(?:[^\(\)]|[\(\)|\(\)][^\(\)]*[\(|\)])*$)/g);
        },
        fireAfter: function(n, fn, ctx) {
            var count = 0;
            return function() {
                count++;
                if (count === n) { fn.call(ctx || null); }
            }
        },
        // Return array of milliseconds
        parseTimes: function(str) {
            var value, array = str.split(/,\s*/);
            for (var i = 0; i < array.length; i++) {
                value = array[i];
                array[i] = parseFloat(value);
                if ( value.match(/\ds/) ) {
                    array[i] = array[i] * 1000;
                }
            }
            return array;
        },

        sumArrayValues: function(/* array1, array2, ...*/) {
            var values = [];
            for (var i = arguments.length - 1; i >= 0; i--) {
                values = values.concat(arguments[i]);
            }
            var sum = function(a, b) { return a + b; };
            return _.reduce(values, sum, 0);
        },

        css: function(el, prop) {
            var style = w.getComputedStyle(el, null);
            return style.getPropertyValue(prop);
        },

        hasClass: function(el, className) {
            return el.classList.contains(className);
        },

        addClass: function(el, className) {
            className && el.classList.add(className);
            return u;
        },

        removeClass: function(el, className) {
            className && el.classList.remove(className);
            return u;
        },

        repaint: function(el) {
            var a = el.offsetHeight;
            return u;
        }
    }



    // defaults
    var defaults = {
        transitionsEnabled: transitionsFeatureTest(),
        end: u.noop,
        endAll: u.noop,
        // TODO: not fancy
        __cache: {}
    };

    // TODO: reduce verbosity
    var defaultHooks = {
        displayNone: {
            before: function(el, transition) {
                var cssDisplay = u.css(el, 'display');
                if (cssDisplay === 'none') {
                    // FIX: instead of block, should be the value we are transitioning to
                    el.style.display = 'block';
                } else if (cssDisplay) {
                    el.style.display = cssDisplay;
                }
            },

            afterPerform: function() {},

            after: function(el) {
                el.style.display = '';
            }
        },
        // width/height
        sizeAuto: {
            before: function(attr, el, transition, opts) {
                if (! transition.props[attr]) { return; }

                var reverse_method = opts.method === 'addClass' ?
                    'removeClass' : 'addClass';

                var attrVal = u.css(el, 'height');
                if (attrVal === '0px') {
                    u[opts.method](el, opts.className).repaint(el);
                    opts.__cache[attr] = u.css(el, attr);
                    u.repaint(el)[reverse_method](el, opts.className);
                    el.style[attr] = '0px';
                } else {
                    el.style[attr] = attrVal;
                }
            },

            afterPerform: function(attr, el, transition, opts) {
                if (! transition.props[attr]) { return; }

                el.style[attr] = opts.__cache[attr] || '0px';
                opts.__cache[attr] = null;
            },

            after: function(attr, el) {
                el.style[attr] = '';
            }
        }
    };


    // private methods   (endAllCallback || opts, featureTest)
    function _argsToOpts() {
        var optsIsFn = _.isFunction(arguments[0]);
        var opts = arguments[0] && !optsIsFn ? _.extend({}, defaults, arguments[0]) : _.extend({}, defaults);
        optsIsFn && (opts.endAll = arguments[0]);
        ! _.isUndefined(arguments[1]) && (opts.transitionsEnabled = arguments[1]);
        return opts;
    }

    function _bindTransEndFallback(el, opts) {
        performClassChange(el, opts);
        opts.end(el, 'all');
        opts.endAll(el);
    }

    function _bindTransEnd(el, opts) {
        if (! opts.transitionsEnabled) {
            _bindTransEndFallback(el, opts);
            return;
        }

        var finished = false;

        // read CSS transition value
        u.addClass(el, 'transition').repaint(el);
        var transition = _getTransitionValue(el);
        u.removeClass(el, 'transition').repaint(el);
        if (!transition.length) { return; }

        // all transitions finished callback
        var endAllCallbackWrapper = function() {
            finished = true;
            el.removeEventListener(transitionEndEvent, endCallbackWrapper);
            u.removeClass(el, 'transition');
            hook('after', el, transition, opts);
            opts.endAll && opts.endAll(el);
        }
        var endAllCallbackHandler = u.fireAfter(transition.length, endAllCallbackWrapper);
        var endCallbackWrapper = function(e) {
            e && e.stopPropagation(); // prevent breaks using nested transitions
            opts.end && opts.end(el, e.propertyName);
            endAllCallbackHandler();
        }

        el.addEventListener(transitionEndEvent, endCallbackWrapper);

        hook('before', el, transition, opts);
        performClassChange(el, opts);
        u.addClass(el, 'transition').repaint(el);
        hook('afterPerform', el, transition, opts);

        setTimeout(function() {
            if (!finished) { endAllCallbackWrapper(); }
        }, transition.duration);
    }

    function hook(name, el, transition, opts) {
        var props = transition.props;

        if (props.opacity || props.width || props.height) {
            defaultHooks.displayNone[name](el, transition, opts);
        }

        if (props.width) {
            defaultHooks.sizeAuto[name]('width', el, transition, opts);
        }

        if (props.height) {
            defaultHooks.sizeAuto[name]('height', el, transition, opts);
        }

        u.repaint(el);
    }

    function performClassChange(el, opts) {
        if (! opts.method) { return }
        // u.repaint(el);
        u[opts.method](el, opts.className);
    }

    function _getTransitionValue(el) {
        var style = w.getComputedStyle(el, null);
        var css = function(prop) { return style.getPropertyValue(prop); }
        var transProps = css('transition-property').split(',');
        var transDurations = u.parseTimes(css('transition-duration'));
        var transDelays = u.parseTimes(css('transition-delay'));
        var totalDuration = u.sumArrayValues(transDurations, transDelays);
        var props = {};

        _.each(transProps, function(prop) { props[prop.trim()] = true; });

        return {
            length: transProps.length,
            props: props,
            duration: totalDuration
        };
    }



    // Trans.js public methods
    var Trans = {
        defaults: defaults,
        defaultHooks: defaultHooks,
        transEndAll: function(el) {
            var opts = _argsToOpts.apply(null, u.slice(arguments, 1));
            _bindTransEnd(el, opts);
        },
        addTransClass: function(el, className) {
            var opts = _argsToOpts.apply(null, u.slice(arguments, 2));
            opts.method = 'addClass';
            opts.className = className;

            u.repaint(el); // prevent transition break if changing class after calling this method.
            _bindTransEnd(el, opts);
        },
        removeTransClass: function(el, className) {
            var opts = _argsToOpts.apply(null, u.slice(arguments, 2));
            opts.method = 'removeClass';
            opts.className = className;

            u.repaint(el); // prevent transition break if changing class after calling this method.
            _bindTransEnd(el, opts);
        }
    };


    return Trans;
}));