'use strict';

require('./home.scss');

module.exports = angular.module('slackbots.home', [
    require('./home.controller').name
]);
