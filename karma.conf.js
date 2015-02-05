// Karma configuration
// Generated on Thu Mar 13 2014 14:12:04 GMT-0700 (PDT)

module.exports = function(config) {

    config.set({
        frameworks: ['mocha', 'chai'],

        client: {
            mocha: {
                reporter: 'html', // change Karma's debug.html to the mocha web reporter
                ui: 'bdd'
            }
        },

        files: [
            {pattern: 'tests.css', include: true},
            {pattern: 'node_modules/underscore/underscore.js', include: true},
            {pattern: 'trans.js', include: true},
            'tests.js'
        ],

        reporters: ['mocha'],

        // level of logging (config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG)
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // Start these browsers, currently available:
        // Chrome, ChromeCanary, Firefox, Opera, Safari (only Mac), PhantomJS, IE (only Windows)
        browsers: ['Chrome', 'Firefox', 'Safari']
    });
};