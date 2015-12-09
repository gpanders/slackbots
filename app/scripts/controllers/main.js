'use strict';

angular
.module('slackbotsApp')
.controller('MainCtrl', function($rootScope, $scope, $cookies, $state, SlackFactory) {
    $scope.loaded = false;
    $scope.bots = [];

    $scope.checkToken = function(token) {
        SlackFactory.authorize(token).then(
            function(user) {
                $rootScope.user = user;
                $cookies.put('slackbotsAppToken', token);
                $scope.authMessage = 'Authorized! Loading bots...';
                $scope.loaded = true;

                $state.go('bots').then(function() {
                    $scope.authMessage = '';
                });


            },
            function(err) {
                $cookies.remove('slackbotsAppToken');
                delete $rootScope.user;
                $scope.authMessage = 'Authorization failed: ' + err;
                $scope.loaded = true;
            }
        );
    };

    $scope.signOut = function() {
        $cookies.remove('slackbotsAppToken');
        $scope.bots = [];
        delete $rootScope.user;
        $state.go('default');
    };

    var modal = {};

    $scope.editBotImage = function(bot) {
        openModal(bot);
    };

    $scope.editAttachmentImage = function(bot) {
        openModal(bot.attachments);
    };

    $scope.modalSubmit = function(url) {
        modal.field.imageUrl = url;
        if (modal.field.hasOwnProperty('unsaved')) {
            modal.field.unsaved = true;
        }
    };

    var token = $cookies.get('slackbotsAppToken');
    if (token) {
        $scope.checkToken(token);
    } else {
        $scope.loaded = true;
    }

    function openModal(field) {
        modal.field = field;
        $scope.imageUrlValue = field.imageUrl;
    }
});
