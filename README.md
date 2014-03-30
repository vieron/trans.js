# trans.js

  Cross-browser CSS transitions

  [![Build Status](https://travis-ci.org/vieron/trans.js.png?branch=master)](https://travis-ci.org/vieron/trans.js)


## Installation

  Install with bower:

    $ bower install trans.js


## Features

* It handles well transitions between elements with the following properties:
    * `display: none;`  <=>  `display: block;`
    * `height: 0;`      <=>  `height: auto;`
    * `width: 0;`       <=>  `width: auto;`
    * `opacity: 0;`     <=>  `opacity: 1;`

* It handles events not fired in transitions between equal values...
* TransitionEnd callbacks and events, by property or at the end of all transitions
* Fallback to addClass/removeClass when transitions aren't supported. All transitionEnd
events and callbacks binded will be fired.


## Options

```
{
    end: function(propKey, instance) {}, // fired at the end of transition of each property
    endAll: function(propKey, instance) {} // fired once at the end of all transitions
}
```

## API

### `.addTransClass(className [, callbackFn || options])`

### `.removeTransClass(className [, callbackFn || options])`

Add or remove a class on a element and fires transitionEnd callbacks.

* className: (string) The class or group of classes separated by commas to add or remove.
* callabckFn: (function) Callback function fired at the end of all transitions.
* options: (object) Object width options.


## Events

You can subscribe to the following events:

### `trans:end`

```
$('#foo').on('trans:end', function(propKey, transInstance) {
    console.log('end of ', propKey, ' transition');
});

$('#foo').addTransClass('js-active');
```

### `trans:end:[propName]`

```
$('#foo').on('trans:end:background-color', function(propKey, transInstance) {
    console.log('end of background color transition');
});

$('#foo').addTransClass('js-active');
```

### `trans:endAll`

```
$('#foo').on('trans:endAll', function(transInstance) {
    console.log('end of all transitions');
});

$('#foo').addTransClass('js-active');
```


## Utilities

Note that this utilities do not handle transitions between not transitionable
attributes listed above.

Do not provide any kind of fallback.

### `.transEnd(callbackFn [, context])`

```
$('#foo').transEnd(function(prop) {
    console.log('transEnd method ' + prop);
});

$('#foo').addClass('js-active');
```


### `transEnd` jQuery event type

```
$('#foo').on('transEnd', function(e) {
    console.log('transEnd method', e.originalEvent.propertyName);
});

$('#foo').addClass('js-active');

// remember unbind the event
$('#foo').off('transEnd');

```

### `.noTrans(callbackFn [, context])`

Perform changes in CSS attributes that have CSS transitions applied without transitioning them.

```
$('#foo').noTrans(function(prop) {
    // all changes here will be done without transitions
    $('#foo').css('height', 200);
    $('#foo').css('width', 500);
});
```



## Known problems

* Do not transition shorthand properties like background, use expanded properties instead: background-color, background-position...

## Browser support

* Safari
* Chrome
* Opera
* Firefox
* IE9 +

## TODO

* trans.js uses display block instead of the display property value of the element (fix in next version)
* un-vendor prefix property keys used in transProps and in `trans:end:propKey` events.
* API to enqueue transitions
* implement promises with $.Deferred

## License

  MIT
