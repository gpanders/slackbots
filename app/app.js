import { HomeModule, HomeState } from './home';
import { BotsModule, BotsState } from './bots';

module.exports = angular.module('slackbots', [
    'ui.router',
    HomeModule,
    BotsModule
])
.config(($stateProvider, $urlRouterProvider, $locationProvider) => {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

    $stateProvider
        .state('home', HomeState)
        .state('home.bots', BotsState);
});
