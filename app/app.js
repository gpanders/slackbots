import Slack from './slack/slack.module';
import Token from './token/token.module';
import Home from './home/home.module';
import User from './user/user.module';
import Bots from './bots/bots.module';

import FocusOn from './core/focusOn';

import BotsState from './bots/bots.state';

module.exports = angular.module('slackbots', [
    // vendor
    'angular-storage',
    'ui.router',
    'ui.sortable',

    // app
    Slack.name,
    Token.name,
    User.name,
    Home.name,
    Bots.name
])
.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

    $stateProvider
        .state('default', {
            url: '/',
            template: ''
        })
        .state('bots', BotsState);
})
.directive('focusOn', FocusOn);
