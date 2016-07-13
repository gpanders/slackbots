import { HomeModule, HomeState } from './home';
import { BotsModule, BotsState } from './bots';

export default angular.module('slackbots', [
    // External dependencies
    'ui.router',

    // App dependencies
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
