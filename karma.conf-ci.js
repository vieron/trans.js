var fs = require('fs');

module.exports = function(config) {

    // Use ENV vars on Travis and sauce.json locally to get credentials
    if (!process.env.SAUCE_USERNAME) {
        if (!fs.existsSync('sauce.json')) {
            console.log('Create a sauce.json with your credentials based on the sauce-sample.json file.');
            process.exit(1);
        } else {
            process.env.SAUCE_USERNAME = require('./sauce').username;
            process.env.SAUCE_ACCESS_KEY = require('./sauce').accessKey;
        }
    }

    // Browsers to run on Sauce Labs
    var customLaunchers = {
        'SL_Chrome': {
            base: 'SauceLabs',
            browserName: 'chrome',
            platform: 'OS X 10.9'
        },
        'SL_Firefox': {
            base: 'SauceLabs',
            browserName: 'firefox',
            platform: 'OS X 10.9'
        },
        'SL_Safari': {
            base: 'SauceLabs',
            browserName: 'safari',
            platform: 'OS X 10.9'
        },
        'SL_IE9': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '9'
        },
        'SL_IE10': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '10'
        },
        'SL_IE11': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '11'
        }
    };

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
            {pattern: 'bower_components/classlist/classList.js', include: true},
            {pattern: 'trans.js', include: true},
            'tests.js'
        ],

        reporters: ['dots', 'saucelabs'],

        sauceLabs: {
            testName: 'trans.js',
            recordVideo: true
        },

        captureTimeout: 120000,

        customLaunchers: customLaunchers,

        browsers: Object.keys(customLaunchers),

        // because we are running tests in saucelabs...
        browserDisconnectTimeout: 10000,
        browserDisconnectTolerance: 5,
        browserNoActivityTimeout: 20000,

        // Continuous Integration mode (if true, Karma captures browsers, runs the tests and exits)
        singleRun: true
    });
};