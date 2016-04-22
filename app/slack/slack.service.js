'use strict';

export class SlackService {
    /*@ngInject*/
    constructor($rootScope, $q, $http, UserService) {
        this.$rootScope = $rootScope;
        this.$q = $q;
        this.$http = $http;
        this.UserService = UserService;
    }

    authorize(token) {
        let deferred = this.$q.defer();

        this.$http({
            method: 'GET',
            url: 'https://slack.com/api/auth.test',
            params: { token: token }
        }).then(res => {
            if (res.data.ok) {
                let user = {};
                user.token = token;
                user.username = res.data.user;
                user.id = res.data['user_id'];
                deferred.resolve(user);
            } else {
                deferred.reject('Invalid token');
            }
        }, res => {
            console.error(res);
            deferred.reject('An error occurred');
        });

        return deferred.promise;
    }

    getUserInfo(userId) {
        let deferred = this.$q.defer();
        this.UserService.getUser().then(user => {
            this.$http({
                method: 'GET',
                url: 'https://slack.com/api/users.info',
                params: {
                    token: user.token,
                    user: userId
                }
            }).then(res => {
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
            }, res => {
                deferred.reject('Error getting user info');
                console.error(res);
            });
        }, () => deferred.reject('No authenticated user found'));

        return deferred.promise;
    }

    postMessage(data) {
        let deferred = this.$q.defer();
        this.UserService.getUser().then(user => {
            data.token = user.token;

            this.$http({
                method: 'POST',
                url: 'https://slack.com/api/chat.postMessage',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                data: $.param(data)
            }).then(res => {
                if (res.data.ok) {
                    deferred.resolve(res.data);
                } else {
                    deferred.reject('Slack denied our request to post a message');
                    console.error(res.data);
                }
            }, res => {
                deferred.reject('Error posting message');
                console.error(res);
            });
        }, () => deferred.reject('No authorized user found'));

        return deferred.promise;
    }

    openIM(userId) {
        let deferred = this.$q.defer();
        this.UserService.getUser().then(user => {

            this.$http({
                method: 'GET',
                url: 'https://slack.com/api/im.open',
                params: {
                    token: user.token,
                    user: userId
                }
            }).then(res => {
                if (res.data.ok) {
                    deferred.resolve(res.data.channel.id);
                } else {
                    deferred.reject('Slack denied our request to open an IM channel');
                }
            }, res => {
                console.error(res);
                deferred.reject('Error opening IM channel');
            });
        }, () => deferred.reject('No authenticated user found'));

        return deferred.promise;
    }

    getData(type) {
        let deferred = this.$q.defer();
        this.UserService.getUser().then(user => {
            let token = user.token;
            if (type === 'users') {
                let users = {};
                this.$http({
                    method: 'GET',
                    url: 'https://slack.com/api/users.list?token=' + token
                }).then(res => {
                    if (res.data.ok) {
                        res.data.members
                            .filter(member => !member.deleted && !member['is_bot'])
                            .forEach(member => { users[member.id] = { name: '@' + member.name }; });

                        this.$http({
                            method: 'GET',
                            url: 'https://slack.com/api/im.list?token=' + token
                        }).then(res => {
                            if (res.data.ok) {
                                res.data.ims
                                    .filter(im => im['is_im'] && !im['is_user_deleted'] && users[im.user])
                                    .forEach(im => { users[im.user].im = im.id; });

                                deferred.resolve(users);
                            } else {
                                deferred.reject('Slack denied our request for IM list');
                            }
                        }, () => {
                            deferred.reject('Error retrieving IM list for users');
                        });
                    } else {
                        deferred.reject('Slack denied our request for users list');
                    }
                }, () => {
                    deferred.reject('Error retrieving users list');
                });
            } else if (type === 'channels') {
                let channels = {};
                this.$http({
                    method: 'GET',
                    url: 'https://slack.com/api/channels.list?token=' + token
                }).then(res => {
                    if (res.data.ok) {
                        res.data.channels
                           .filter(channel => channel['is_channel'] && channel['is_member'])
                           .forEach(channel => { channels[channel.id] = '#' + channel.name; });

                        deferred.resolve(channels);
                    } else {
                        deferred.reject('Slack denied our request for channels list');
                    }
                }, () => {
                    deferred.reject('Error retrieving channels list');
                });
            } else if (type === 'groups') {
                let groups = {};
                this.$http({
                    method: 'GET',
                    url: 'https://slack.com/api/groups.list?token=' + token
                }).then(res => {
                    if (res.data.ok) {
                        res.data.groups
                            .filter(group => group['is_group'] && !group['is_archived'])
                            .forEach(group => { groups[group.id] = group.name; });

                        deferred.resolve(groups);
                    } else {
                        deferred.reject('Slack denied our request for groups list');
                    }
                }, () => {
                    deferred.reject('Error retrieving groups list');
                });
            }
        }, () => deferred.reject('No authenticated user found'));

        return deferred.promise;
    }
}
