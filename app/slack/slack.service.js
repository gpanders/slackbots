'use strict';

module.exports = angular.module('slackbots.slackService', [])
.factory('SlackFactory', function($http, $rootScope, $q) {
    var service = {};

    service.authorize = function(token) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: 'https://slack.com/api/auth.test',
            params: { token: token }
        }).then(
            function(res) {
                if (res.data.ok) {
                    var user = {};
                    user.token = token;
                    user.username = res.data.user;
                    user.id = res.data['user_id'];
                    deferred.resolve(user);
                } else {
                    deferred.reject('Invalid token');
                }
            },
            function(res) {
                console.error(res);
                deferred.reject('An error occurred');
            }
        );

        return deferred.promise;
    };

    service.getUserInfo = function(userId) {
        var deferred = $q.defer();
        var user = $rootScope.user;
        if (!user || !user.token) {
            deferred.reject('No authenticated user found');
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: 'https://slack.com/api/users.info',
            params: {
                token: user.token,
                user: userId
            }
        }).then(
            function(res) {
                if (res.data.ok) {
                    var profile = res.data.user.profile;
                    var info = {};
                    info.realName = profile['real_name'];
                    info.imageUrl = profile['image_original'];
                    deferred.resolve(info);
                } else {
                    deferred.reject('Slack denied our request for user info');
                    console.error(res.data);
                }
            },
            function(res) {
                deferred.reject('Error getting user info');
                console.error(res);
            }
        );

        return deferred.promise;
    };

    service.postMessage = function(data) {
        var deferred = $q.defer();
        var user = $rootScope.user;
        if (!user || !user.token) {
            deferred.reject('No authenticated user found');
            return deferred.promise;
        }

        data.token = user.token;

        $http({
            method: 'POST',
            url: 'https://slack.com/api/chat.postMessage',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: $.param(data)
        }).then(
            function(res) {
                if (res.data.ok) {
                    deferred.resolve(res.data);
                } else {
                    deferred.reject('Slack denied our request to post a message');
                    console.error(res.data);
                }
            },
            function(res) {
                deferred.reject('Error posting message');
                console.error(res);
            }
        );

        return deferred.promise;
    };

    service.openIM = function(userId) {
        var deferred = $q.defer();
        var user = $rootScope.user;
        if (!user || !user.token) {
            deferred.reject('No authenticated user found');
            return deferred.promise;
        }

        $http({
            method: 'GET',
            url: 'https://slack.com/api/im.open',
            params: {
                token: user.token,
                user: userId
            }
        }).then(
            function(res) {
                if (res.data.ok) {
                    deferred.resolve(res.data.channel.id);
                } else {
                    deferred.reject('Slack denied our request to open an IM channel');
                }
            },
            function(res) {
                console.error(res);
                deferred.reject('Error opening IM channel');
            }
        );

        return deferred.promise;
    };

    service.getData = function(type) {
        var deferred = $q.defer();
        var user = $rootScope.user;
        if (!user || !user.token) {
            deferred.reject('No authenticated user found');
            return deferred.promise;
        }

        var token = user.token;
        if (type === 'users') {
            var users = {};
            $http({
                method: 'GET',
                url: 'https://slack.com/api/users.list?token=' + token
            }).then(function(res) {
                if (res.data.ok) {
                    res.data.members
                        .filter(function(member) { return !member.deleted && !member['is_bot']; })
                        .forEach(function(member) { users[member.id] = { name: '@' + member.name }; });

                    $http({
                        method: 'GET',
                        url: 'https://slack.com/api/im.list?token=' + token
                    }).then(function(res) {
                        if (res.data.ok) {
                            res.data.ims
                                .filter(function(im) { return im['is_im'] && !im['is_user_deleted'] && users[im.user]; })
                                .forEach(function(im) { users[im.user].im = im.id; });

                            deferred.resolve(users);
                        } else {
                            deferred.reject('Slack denied our request for IM list');
                        }
                    }, function() {
                        deferred.reject('Error retrieving IM list for users');
                    });
                } else {
                    deferred.reject('Slack denied our request for users list');
                }
            }, function() {
                deferred.reject('Error retrieving users list');
            });
        } else if (type === 'channels') {
            var channels = {};
            $http({
                method: 'GET',
                url: 'https://slack.com/api/channels.list?token=' + token
            }).then(function(res) {
                if (res.data.ok) {
                    res.data.channels
                       .filter(function(channel) { return channel['is_channel'] && channel['is_member']; })
                       .forEach(function(channel) { channels[channel.id] = '#' + channel.name; });

                    deferred.resolve(channels);
                } else {
                    deferred.reject('Slack denied our request for channels list');
                }
            }, function() {
                deferred.reject('Error retrieving channels list');
            });
        } else if (type === 'groups') {
            var groups = {};
            $http({
                method: 'GET',
                url: 'https://slack.com/api/groups.list?token=' + token
            }).then(function(res) {
                if (res.data.ok) {
                    res.data.groups
                        .filter(function(group) { return group['is_group'] && !group['is_archived']; })
                        .forEach(function(group) { groups[group.id] = group.name; });

                    deferred.resolve(groups);
                } else {
                    deferred.reject('Slack denied our request for groups list');
                }
            }, function() {
                deferred.reject('Error retrieving groups list');
            });
        }
        return deferred.promise;
    };

    return service;
});
