'use strict';

module.exports = angular.module('slackbots.botsCtrl', [])
.controller('BotsCtrl', function($rootScope, $scope, $http, $q, BotFactory, SlackFactory, user, bots, users, channels, groups) {
    $scope.sortOpts = {
        stop: function() {
            $scope.bots.forEach(updateIndices);
        }
    };

    $scope.bots = bots;
    $scope.users = users;
    $scope.channels = channels;
    $scope.groups = groups;

    $scope.bots.unshift({
        isUser: true,
        botname: user.realName,
        imageUrl: user.imageUrl
    });

    $scope.newBot = function() {
        var newBot = { userId: $rootScope.user.id, botname: 'NewBot', index: 0 };
        BotFactory.create(newBot).then(
            function(bot) {
                $scope.bots.unshift(bot);
                $scope.bots.forEach(updateIndices);
            },
            function(res) {
                console.error('Failed to add new bot');
                console.error(res);
            }
        );
    };

    $scope.save = function(bot) {
        if (bot.isUser) {
            return;
        }

        BotFactory.update(bot).then(
            function() {},
            function(res) {
                console.error('Failed to save bot');
                console.error(res);
            }
        );
    };

    $scope.delete = function(bot) {
        if (confirm('Are you sure you want to delete this bot?')) {
            BotFactory.delete(bot._id).then(
                function() {
                    var pos = $scope.bots.indexOf(bot);
                    $scope.bots.splice(pos, 1);
                },
                function(res) {
                    console.error('Failed to delete bot');
                    console.error(res);
                }
            );
        }
    };

    $scope.send = function(bot) {
        if (!$rootScope.user || !$rootScope.user.token) {
            return alert('No authenticated user found');
        }

        var deferred = $q.defer();
        var channel = bot.channel;
        var message = bot.message;
        bot.message = '';
        if (bot.type === 'user') {
            // channel is user ID
            if (!bot.postAsSlackbot) {
                if ($scope.users[channel].im) {
                    deferred.resolve($scope.users[channel].im);
                } else {
                    SlackFactory.openIM(channel).then(deferred.resolve);
                }
            } else {
                deferred.resolve(channel);
            }
        } else {
            deferred.resolve(channel);
        }

        deferred.promise.then(function(channel) {
            var data = {
                channel: channel,
                text: message,
                username: bot.botname,
                icon_url: bot.imageUrl,
                as_user: bot.isUser
            };

            if (bot.attachments) {
                data.attachments = JSON.stringify([{
                    fallback: bot.attachments.fallback,
                    image_url: bot.attachments.imageUrl
                }]);
            }

            SlackFactory.postMessage(data).then(
                function(res) {
                    console.log(res);
                },
                function(res) {
                    console.error(res);
                }
            );
        });
    };

    function updateIndices(bot, i) {
        if (bot.index !== +i) {
            bot.index = +i;
            $scope.save(bot);
        }
    }

});
