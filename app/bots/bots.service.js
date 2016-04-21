'use strict';

module.exports = angular.module('slackbots.botsFactory', [])
.factory('BotFactory', function($rootScope, $http, $q) {
    var service = {};

    service.getAll = function() {
        var deferred = $q.defer();

        var user = $rootScope.user;
        if (!user || !user.id) {
            deferred.reject('No authenticated user found');
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: '/bots/list',
            params: { userId: user.id }
        }).then(
            function(res) {
                deferred.resolve(res.data);
            },
            function(res) {
                console.error('Failed to get bot list');
                deferred.reject(res);
            }
        );

        return deferred.promise;


    };

    service.create = function(bot) {
        var deferred = $q.defer();
        var user = $rootScope.user;
        if (!user || !user.id) {
            deferred.reject('No authenticated user found');
            return deferred.promise;
        }

        bot.userId = user.id;

        $http({
            method: 'POST',
            url: '/bots/create',
            data: bot
        }).then(
            function(res) {
                deferred.resolve(res.data);
            },
            function(res) {
                deferred.reject(res);
            }
        );
        return deferred.promise;
    };

    service.update = function(bot) {
        var deferred = $q.defer();
        var user = $rootScope.user;
        if (!user || !user.id) {
            deferred.reject('No authenticated user found');
            return deferred.promise;
        }

        bot.userId = user.id;

        $http({
            method: 'PUT',
            url: '/bots/update',
            params: { id: bot._id },
            data: bot
        }).then(
            function(res) {
                deferred.resolve(res.data);
            },
            function(res) {
                deferred.reject(res);
            }
        );
        return deferred.promise;
    };

    service.delete = function(id) {
        var deferred = $q.defer();
        var user = $rootScope.user;
        if (!user || !user.id) {
            deferred.reject('No authenticated user found');
            return deferred.promise;
        }

        $http.delete('/bots/delete?id=' + id).then(
            function(res) {
                deferred.resolve(res.data);
            },
            function(res) {
                deferred.reject(res);
            }
        );
        return deferred.promise;
    };

    return service;
});
