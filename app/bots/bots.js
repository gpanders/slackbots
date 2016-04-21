require ('./bots.scss');

module.exports = angular.module('slackbots.bots', [
    require('./bots.controller').name,
    require('./bots.service').name,
    require('./bots.directives').name
]);
