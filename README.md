[![Build Status](https://travis-ci.org/vieron/trans.js.png?branch=master)](https://travis-ci.org/vieron/trans.js)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/transjs.svg)](https://saucelabs.com/u/transjs)

# trans.js

Cross-browser CSS transitions.

Trans.js is a small JavaScript library that allows you manage CSS transitions adding or removing CSS classes previously defined by you in your stylesheets.

**Why another?**

Yes, there is a lot of alternatives to manage CSS transitions, like [gsap](https://greensock.com/gsap), [Velocity.js](http://julian.com/research/velocity/), [jquery.transit](http://ricostacruz.com/jquery.transit/)...

The main goal of Trans.js it's to keep your transitions logic in the CSS, not spreading your javascript with a lot of appearance-related code.

A visual example, trans.js let's you write this:

```css
// In your CSS
.t-fade {
    width: 400px;
    opacity: 1;
}

.t-fade.transition {
    transition: width 0.2s ease-in, opacity 0.6s ease-out;
}

.t-fade.is-hidden {
    width: 100px;
    opacity: 0;
}
```

```js
// In your JS
Trans.addTransClass(el, 'is-hidden', function() {
    // transitionEnd callback
});
```

Instead of this, with hardcoded values in our CSS:

```js
// pseudo-code
el.transition({
    width: '100px',
    opacity: 0,
    easing: {width: 'ease-in', opacity: 'ease-out'},
    duration: {width: 0.2, opacity: 0.6}
}, function() {
    // transitionEnd callback
});
```

## Features

* Manage transitions from your CSS.
* It handles transitions automatically in elements with display none/block.
* It handles transitions automatically in elements with width auto/0 or height auto/0.
* Cross-browser transitionEnd callbacks, per property or at the end of the whole transition.
* Customizable after/before transition hooks.

## Installation

Install with bower:

    $ bower install trans.js


## Usage


In your javascript:

```js
var el = document.querySelector('.foo');
Trans.addTransClass(el, 'js-isHidden', function(el) {
   // do something when the whole transition ends
});
```

or

```js
var el = document.querySelector('.foo');
Trans.addTransClass(el, 'js-isHidden', {
    transitionsEnabled: Modernizr.csstransitions,
    end: function(el, propertyKey) {
        // do something when the 'propertyKey' transition finish
    },
    endAll: function(el) {
        // do something when the whole transition ends
    }
});

```

In your CSS:

```css
// this code is not vendor-prefixed for brevity

.foo {
    width: 400px;
    height: auto;
    display: block;
}

.foo.transition {
    transition: width 0.3s, height 0.6s;
}

.foo.js-isHidden {
    width: 200px;
    height: 0px;
    display: none;
}
```

### Available methods are:

* Trans.addTransClass(el, 'className' [, endAllCallback || opts]);
* Trans.removeTransClass(el, 'className' [, endAllCallback || opts]);
* Trans.transEnd(el [, endAllCallback || opts]);


### Notes

If `opts.transitionsEnabled` is equal to `false` (explicitly set by you or because the browser doesn´t support CSS transitions), the `end` callback will be fired only once with the `propertyKey` argument set to `'all'`.



### Usage with jQuery

```js
arg1 = className
arg2 = endAllCallback or opts
arg3 = featureTest
$.fn.removeTransClass = function(arg1, arg2, arg3) {
    return this.each(function() {
        Trans.removeTransClass.apply(null, [this, arg1, arg2, arg3]);
    });
}

$.fn.addTransClass = function(arg1, arg2, arg3) {
    return this.each(function() {
        Trans.addTransClass.apply(null, [this, arg1, arg2, arg3]);
    });
}
```

If you need to support IE9 include the [classList pollyfill](https://github.com/eligrey/classList.js) before trans.js is loaded.



## Development

    $ cd trans.js
    $ bower install
    $ npm install

Running tests with karma

    # local browsers
    $ karma start

    # on saucelabs
    $ karma start karma.conf-ci.js


## TODO

Read TODO comments over the code
