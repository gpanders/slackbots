// Karma configuration
// Generated on Tue May 10 2016 16:00:01 GMT-0500 (CDT)
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai-as-promised', 'chai'],

    client: {
        chai: {
            includeStack: true
        }
    },


    // list of files / patterns to load in the browser
    files: [
        'app/vendor.js',
        'app/test.js',
        'app/**/*.spec.js',
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'app/vendor.js': ['webpack'],
        'app/test.js': ['webpack'],
        'app/**/*.spec.js': ['webpack']
    },

    webpack: {
        resolve: webpackConfig.resolve,
        module: webpackConfig.module,
        plugins: [new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })]
    },

    webpackMiddleware: {
        noInfo: true
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: config.singleRun,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
