(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'modernizr'], factory);

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    var $ = require('jquery');
    var Modernizr = require('Modernizr');

    factory(_, $, Modernizr);

  // Finally, as a browser global.
  } else {
    root.Trans = factory(root._, (root.$ || root.jQuery), root.Modernizr);
  }

}(this, function(_, $, Modernizr) {

    'use strict';

    var w = window;
    var doc = document;

    var transitionProperty = Modernizr.prefixed('transition');

    var transitionEndEvent = {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        OTransition: 'otransitionend',
        transition: 'transitionend'
    }[transitionProperty];

    var splitCommasOutside = function(str) {
        return str.split(/(?:,+\s)(?=(?:[^\(\)]|[\(\)|\(\)][^\(\)]*[\(|\)])*$)/g);
    };

    var addStyleTag = function(css) {
        var tag = doc.createElement('style');
        tag.setAttribute('type', 'text/css');
        doc.getElementsByTagName('head')[0].appendChild(tag);
        if (tag.styleSheet) {
            tag.styleSheet.cssText = css;
        } else {
            tag.appendChild(doc.createTextNode(css));
        }
    };


    function Trans($el, opts, fallbackTest) {
        var ins = $el.data('trans');
        var _this = ins || this;
        var optsIsFn = $.isFunction(opts);
        _.isBoolean(opts) && (fallbackTest = opts);

        _this.$el = $el;
        _this.el = $el[0];
        _this.opts = {};

        !optsIsFn && (_this.opts = opts || {});
        optsIsFn && (_this.opts.endAll = opts);

        _this.doFallback = _.isUndefined(fallbackTest) ? !Trans.fallbackTest : !fallbackTest;

        if (!ins) {
            _this.$el.data('trans', _this.init());
        } else {
            return ins;
        }
    }

    Trans.fallbackTest = Modernizr.csstransitions;

    Trans.css = '.js-notransition {' +
                '  -webkit-transition: none !important;' +
                '  -moz-transition: none !important;' +
                '  -o-transition: none !important;' +
                '  -ms-transition: none !important;' +
                '  transition: none !important;' +
                '}';

    Trans.autoProps = {
        'height': true,
        'width': true,
        'opacity': true,
    };

    Trans.maps = {
        'dimension': {
            'from': {
                '0px': '*',
                '*': '*'
            },
            'to': {
                '0px': '',
                '*': ''
            }
        },
        'display': {
            'opacity': {
                'from': {
                    '0': 'block',
                    '1': 'block'
                },
                'to': {
                    '0': 'none',
                    '1': 'block'
                }
            },
            'dimension': {
                'from': {
                    '0px': 'block',
                    '*': 'block'
                },
                'to': {
                    '0px': '',
                    '*': 'block'
                }
            }
        }
    };

    Trans.methods = {
        'add': $.fn.addClass,
        'remove': $.fn.removeClass
    };

    Trans.noTrans = function($el, callback, ctx) {
        $el.addClass('js-notransition');
        callback && callback.call(ctx || $el);
        $el.width(); // repaint
        $el.removeClass('js-notransition');
    };


    _.extend(Trans.prototype, {
        init: function() {
            this.transClass = '';
            this.transProps = {};
            this.transPrefix = _.filter(Modernizr._cssomPrefixes, function(prfx) {
                return Modernizr.prefixed(prfx + 'Transition');
            })[0];
            return this;
        },

        repaint: function() {
            this.$el.width();
        },

        manageAutoProps: function(point, props) {
            props || (props = this.transProps);
            var css = {};

            if (!_.intersection(_.keys(Trans.autoProps), _.keys(props)).length) {
                return;
            }

            var _setProp = function(prop, subprop) {
                var fromVal, toVal, i, val, size, z;
                fromVal = props[(subprop || prop)]['from'];
                toVal = props[(subprop || prop)]['to'];
                i = props[(subprop || prop)][point];

                switch (prop) {
                    case "display":
                        if (fromVal !== '0px' && toVal !== '0px') { return; }
                        i === '0px' || (i = '*');
                        val = Trans.maps.display.dimension[point][i];
                        css['display'] = val;
                    break;

                    case "width":
                    case "height":
                        if ((fromVal == 'auto' || toVal == 'auto') ||
                            (fromVal == '0px' || toVal == '0px')) {
                            size = i !== '0px' ? fromVal : toVal;
                            z = i === '0px' ? '0px' : '*';
                            val = Trans.maps.dimension[point][z];
                            if (val === '*') { val = size; }
                            css[prop] = val;
                        }
                    break;
                }

            };

            if (props['opacity']) {
                var j = props['opacity'][point];
                // console.log(i, point, '---', Trans.maps.display.opacity[point][i]);
                css['display'] = Trans.maps.display.opacity[point][j];
            }


            _.each(['width', 'height'], function(prop) {
                if (props[prop]) {
                    _setProp('display', prop);
                    // _setProp(prop);
                }
            });

            if (_.size(css)) {
                this.$el.css(css);
                this.repaint();
            }
        },

        getTransitionValue: function() {
            var style = w.getComputedStyle(this.el, null);
            this.transitionValue = style.getPropertyValue(transitionProperty);

            if (this.doFallback) {
                this.transitionValue = splitCommasOutside(this.$el.css('transition'));
                return;
            }

            // firefox doesn't return data in shorthand CSS props
            if (!this.transitionValue || !this.transitionValue.length) {
                // TODO: move this to a test method fired after init
                var prefix = this.transPrefix;
                var properties = this.$el.css(prefix + 'TransitionProperty').split(', ');

                var transitions = [];
                for (var i = properties.length - 1; i >= 0; i--) {
                    transitions.push(properties[i]);
                }
                // whitespace after comma is required
                this.transitionValue = transitions.join(', ');
            }

            this.transitionValue = splitCommasOutside(this.transitionValue);
        },

        noTrans: function(callback, ctx) {
            Trans.noTrans(this.$el, callback, ctx || this);
        },

        getTransProps: function(method) {
            var fProp, tProp, fromProps, toProps;
            var res = {};

            this.getTransitionValue();

            this.noTrans(function() {
                fromProps = this.getFromProps(method);
                toProps = this.getToProps(method === 'add' ? 'remove' : 'add');
            });

            for (var propKey in fromProps) {
                fProp = fromProps[propKey];
                tProp = toProps[propKey];

                if (fProp.from !== tProp.to) {
                    fProp.to = tProp.to;
                    res[propKey] = fProp;
                }
            }
            return res;
        },

        getFromProps: function(method) {
            var props = this.getCurrentProps('from');
            Trans.methods[method].call(this.$el, this.transClass);
            this.repaint();
            return props;
        },

        getToProps: function(method) {
            var props = this.getCurrentProps('to');
            Trans.methods[method].call(this.$el, this.transClass);
            this.repaint();
            return props;
        },

        getCurrentProps: function(point) {
            var prop, propKey, transProps, resProp;
            var res = {};
            var style = w.getComputedStyle(this.el, null);
            var propKeys = 'property duration timing-function delay'.split(' ');
            var props = this.transitionValue;

            if (!props.length) { return false; }

            for (var i = props.length - 1; i >= 0; i--) {
                transProps = props[i].split(' ');
                propKey = transProps[0];
                resProp = {};
                resProp[point] = style.getPropertyValue(propKey);
                for (var j = propKeys.length - 1; j >= 0; j--) {
                    resProp[propKeys[j]] = transProps[j];
                }
                res[propKey] = resProp;
            }

            return res;
        },

        addTransClass: function(transClass) {
            this.transClass = transClass;
            this.transition('add');
        },

        removeTransClass: function(transClass) {
            this.transClass = transClass;
            this.transition('remove');
        },

        _transitionFallback: function() {
            $.each(this.transProps, function(propKey, val) {
                this._end(propKey);
            }.bind(this));

            this.endAll();
        },

        transition: function(method) {
            this.stop();

            this.transProps = this.getTransProps(method);

            if (! this.doFallback) {
                this.$el.on(transitionEndEvent + '.trans', {
                    endAll: _.after(_.size(this.transProps), _.bind(this.endAll, this))
                }, _.bind(this.end, this));

                this.manageAutoProps('from');
            }

            // transition start
            this.transitionActive = true;
            this.performClassChange(method);
            // fire end events when no csstransitions support
            this.doFallback && this._transitionFallback();
        },

        performClassChange: function(method) {
            if (this.doFallback) {
                Trans.noTrans(this.$el, function() {
                    Trans.methods[method].call(this.$el, this.transClass);
                }, this);
            } else {
                Trans.methods[method].call(this.$el, this.transClass);
            }
        },

        stop: function() {
            if (!this.transitionActive) { return; }

            this.noTrans(); // add js-notransition class and trigger repaint

            this.endAll();
        },

        _end: function(propKey) {
            var args = [propKey, this];
            this.$el.trigger('trans:end', args);
            this.$el.trigger('trans:end:' + propKey, args);
            this.opts.end && this.opts.end.apply(this.$el, args);
        },

        // e.originalEvent[type || propertyName || elapsedTime || eventPhase]
        end: function(e) {
            var propKey = e.originalEvent.propertyName;

            // ignore other transitionEnd events bubbling up
            if (e.handleObj.namespace !== 'trans' ||
                !this.transProps[propKey] ||
                e.target !== this.el
            ) {
                return;
            }

            this._end(propKey);
            this.transitionActive && e.data.endAll.call(this, e);
        },

        endAll: function(e) {
            var propKey = e && e.originalEvent.propertyName;
            this.transitionActive = false;

            /* Not called in end method because Firefox stops transition if
             * display property is changed during animation */
            ! this.doFallback && this.manageAutoProps('to');

            this.$el.trigger('trans:endAll', [this]);
            this.opts.endAll && this.opts.endAll.call(this.$el, this);

            this.$el.off('.trans');
            delete this.transProps;
        },

        destroy: function() {
            this.stop();
            this.$el.removeData('trans');
        }
    });

    addStyleTag(Trans.css);


    // jquerify
    $.fn.addTransClass = function(transClass, opts, fallbackTest) {
        var t = new Trans(this.eq(0), opts, fallbackTest);
        t.addTransClass(transClass);
        return t.$el;
    };

    $.fn.removeTransClass = function(transClass, opts, fallbackTest) {
        var t = new Trans(this.eq(0), opts, fallbackTest);
        t.removeTransClass(transClass);
        return t.$el;
    };

    $.fn.transEnd = function(callback, ctx, fallbackTest) {
        _.isBoolean(ctx) && (fallbackTest = ctx);
        _.isUndefined(fallbackTest) && (fallbackTest = Trans.fallbackTest);
        var cb = _.bind(callback, ctx || this);

        if (fallbackTest) {
            this.one(transitionEndEvent, function(e) {
                var propKey = e.originalEvent.propertyName;
                cb(propKey);
            });
        } else {
            cb();
        }
        return this;
    };

    $.fn.noTrans = function(callback, ctx) {
        Trans.noTrans(this, callback, ctx);
        return this;
    };

    $.event.special.transEnd = {
        setup: function() {
            if (Trans.fallbackTest) {
                $(this).on(transitionEndEvent + '.transEt', function() {
                    $(this).triggerHandler('transEnd');
                });
            } else {
                $(this).triggerHandler('transEnd');
            }
        },

        teardown: function() {
            Trans.fallbackTest && $(this).off(transitionEndEvent + '.transEt');
        }
    };

    return Trans;

}));