'use strict';

module.exports = angular.module('slackbots.homeCtrl', [])
.controller('HomeCtrl', function($rootScope, $scope, $state, SlackFactory, TokenService) {
    $scope.loaded = false;
    $scope.bots = [];

    $scope.checkToken = function(token) {
        SlackFactory.authorize(token).then(
            function(user) {
                $rootScope.user = user;
                TokenService.save(token);
                $scope.authMessage = 'Authorized! Loading bots...';
                $scope.loaded = true;

                $state.go('bots').then(function() {
                    $scope.authMessage = '';
                });


            },
            function(err) {
                TokenService.clear();
                delete $rootScope.user;
                $scope.authMessage = 'Authorization failed: ' + err;
                $scope.loaded = true;
            }
        );
    };

    $scope.signOut = function() {
        TokenService.clear();
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

    var token = TokenService.get();
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
