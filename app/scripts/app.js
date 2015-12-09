'use strict';

/**
 * @ngdoc overview
 * @name slackbotsApp
 * @description
 * # slackbotsApp
 *
 * Main module of the application.
 */
angular
.module('slackbotsApp', [
    'ngCookies',
    'ui.sortable',
    'ui.router'
])
.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('default', {
            url: '/',
            template: ''
        })
        .state('bots', {
            url: '/',
            templateUrl: 'views/bots.html',
            controller: 'BotsCtrl',
            resolve: {
                user: function($rootScope, SlackFactory) {
                    return SlackFactory.getUserInfo($rootScope.user.id);
                },
                bots: function(BotFactory) {
                    return BotFactory.getAll();
                },
                users: function(SlackFactory) {
                    return SlackFactory.getData('users');
                },
                channels: function(SlackFactory) {
                    return SlackFactory.getData('channels');
                },
                groups: function(SlackFactory) {
                    return SlackFactory.getData('groups');
                },
            }
        });
})
.directive('focusOn', function($timeout) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attr) {
            $scope.$watch($attr.focusOn, function(_focusVal) {
                $timeout(function() {
                    _focusVal ? $element.focus() :
                        $element.blur();
                });
            });
        }
    };
});
