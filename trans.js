;(function($, _, Modernizr) {

    'use strict';

    var w = window;
    var d = document;

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


    function Trans($el, opts) {
        var ins = $el.data('trans');
        var _this = ins || this;
        var optsIsFn = $.isFunction(opts);

        _this.$el = $el;
        _this.el = $el[0];
        _this.opts = {};

        !optsIsFn && (_this.opts = opts || {});
        optsIsFn && (_this.opts.endAll = opts);

        if (!ins) {
            _this.$el.data('trans', _this.init());
        } else {
            return ins;
        }
    }

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
            var i, css = {};

            if (!_.intersection(_.keys(Trans.autoProps), _.keys(props)).length) {
                return;
            }

            var _display = function(prop) {
                var i = props[prop][point];
                i === '0px' || (i = '*');
                var val = Trans.maps.display.dimension[point][i];
                css['display'] = val;
            };

            var _dimension = function(prop) {
                var fromVal, toVal, i, val, size, z;
                fromVal = props[prop]['from'];
                toVal = props[prop]['to'];

                if ((fromVal == 'auto' || toVal == 'auto') ||
                    (fromVal == '0px' || toVal == '0px')) {
                    i = props[prop][point];
                    size = i !== '0px' ? fromVal : toVal;
                    z = i === '0px' ? '0px' : '*';
                    val = Trans.maps.dimension[point][z];
                    if (val === '*') { val = size; }
                    css[prop] = val;
                }
            };

            if (props['opacity']) {
                i = props['opacity'][point];
                css['display'] = Trans.maps.display.opacity[point][i];
            }

            _.each(['width', 'height'], function(prop) {
                if (props[prop]) {
                    _display(prop);
                    _dimension(prop);
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

            // firefox doesn't return data in shorthand CSS props
            if (!this.transitionValue || !this.transitionValue.length) {
                // TODO: move this to a test method fired after init
                var prefix = this.transPrefix;
                var properties = this.$el.css(prefix + 'TransitionProperty').split(', ');
                var durations = this.$el.css(prefix + 'TransitionDuration').split(', ');
                var delays = this.$el.css(prefix + 'TransitionDelay').split(', ');
                var timings = splitCommasOutside(this.$el.css(prefix + 'TransitionTimingFunction'));

                var transitions = [];
                for (var i = properties.length - 1; i >= 0; i--) {
                    transitions.push(properties[i] + ' ' + durations[i] + ' ' + timings[i] + ' ' + (delays[i] || '0s'));
                }
                this.transitionValue = transitions.join(', ');
            }

            this.transitionValue = splitCommasOutside(this.transitionValue);
        },

        getTransProps: function(method) {
            var fProp, tProp;
            var res = {};

            this.getTransitionValue();

            this.$el.addClass('js-notransition');
            var fromProps = this.getFromProps(method);
            var toProps = this.getToProps(method === 'add' ? 'remove' : 'add');
            this.$el.removeClass('js-notransition');

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

        transition: function(method) {
            this.stop();

            this.transProps = this.getTransProps(method);

            this.$el.on(transitionEndEvent + '.trans', {
                endAll: _.after(_.size(this.transProps), _.bind(this.endAll, this))
            }, _.bind(this.end, this));

            // transition start
            this.transitionActive = true;
            this.manageAutoProps('from');
            Trans.methods[method].call(this.$el, this.transClass);
        },

        stop: function() {
            if (!this.transitionActive) { return; }

            this.$el.addClass('js-notransition');
            this.repaint();
            this.$el.removeClass('js-notransition');
            this.endAll();
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

            var args = [propKey, this];
            this.$el.trigger('trans:end', args);
            this.$el.trigger('trans:end:' + propKey, args);
            this.opts.end && this.opts.end.apply(this.$el, args);
            this.transitionActive && e.data.endAll.call(this, e);
        },

        endAll: function(e) {
            var propKey = e && e.originalEvent.propertyName;
            this.transitionActive = false;

            /* Not called in end method because Firefox stops transition if
             * display property is changed during animation */
            this.manageAutoProps('to');

            this.$el.trigger('trans:endAll', [this]);
            this.opts.endAll && this.opts.endAll.call(this.$el, this);

            this.$el.off('.trans');
            delete this.transProps;
            delete this.completedTransitions;
        },

        destroy: function() {
            this.stop();
            this.$el.removeData('trans');
        }
    });

    addStyleTag(Trans.css);


    // jquerify
    $.fn.addTransClass = function(transClass, opts) {
        var t = new Trans(this.eq(0), opts);
        t.addTransClass(transClass);
        return t.$el;
    };

    $.fn.removeTransClass = function(transClass, opts) {
        var t = new Trans(this.eq(0), opts);
        t.removeTransClass(transClass);
        return t.$el;
    };

    return Trans;

})(this, jQuery, _, Modernizr);