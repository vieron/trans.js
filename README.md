
# trans.js

  Cross-browser CSS transitions

## Installation

  Install with bower:

    $ bower install trans.js


## Features

* It handles well transitions between elements with the following properties:
    * display: none;  <>  display: block;
    * height: 0;      <>  height: auto;
    * width: 0;       <>  width: auto;
    * opacity: 0;     <>  opacity: 1;

* It handles events not fired in transitions between equal values...
* Callbacks for transitionEnd events, by property and at the end of all transitions


## Options

```
{
    end: function(propKey, instance) {}, // fired at the end of transition of each property
    endAll: function(propKey, instance) {} // fired once at the end of all transitions
}
```

## API

### .addTransClass(className [, callbackFn | options])
### .removeTransClass(className [, callbackFn | options])

Add or remove a class on a element and transitionEnd callbacks if passed.

* className: (string) The class or group of classes separated by commas to add or remove.
* callabckFn: (function) Callback function fired at the end of all transitions.
* options: (object) Object width options.


## Events

You can subscribe to the following events:

### trans:end

```
$('#foo').on('trans:end', function(propKey, transInstance) {
    console.log('end of ', propKey, ' transition');
});
```

### trans:end:[propName]

```
$('#foo').on('trans:end:background-color', function(propKey, transInstance) {
    console.log('end of background color transition');
});
```

### trans:endAll

```
$('#foo').on('trans:endAll', function(transInstance) {
    console.log('end of all transitions');
});
```


## Known problems

* Do not transition shorthand properties like background, use expanded properties instead: background-color, background-position...

## Browser support

* Safari
* Chrome
* Opera
* Firefox

## TODO

* trans.js uses display block instead of the display property value of the element (fix in next version)
* un-vendor prefix property keys used in transProps and in `trans:end:propKey` events.

## License

  MIT
