global.jQuery = global.$ = require('jquery');
require('jquery-ui/sortable');

require('angular');
require('angular-storage');
require('angular-ui-sortable');
require('angular-ui-router');

module.exports = angular.module('slackbots', [
    // vendor
    'angular-storage',
    'ui.router',
    'ui.sortable',

    // app
    require('./slack/slack').name,
    require('./token/token').name,
    require('./home/home').name,
    require('./bots/bots').name
])
.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

    $stateProvider
        .state('default', {
            url: '/',
            template: ''
        })
        .state('bots', require('./bots/bots.state'));
});
