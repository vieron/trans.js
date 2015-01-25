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

### Usage with jQuery

```js
// arg1 = className
// arg2 = endAllCallback or config object
// arg3 = featureTest
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



## TODO

Read TODO comments over the code


