import { UserService } from '../user';

export const SlackService = angular.module('SlackService', [
    UserService
]).service('SlackService', class SlackService {
    /*@ngInject*/
    constructor($http, $q, $log, UserService) {
        this.$http = $http;
        this.$q = $q;
        this.$log = $log;
        this.userService = UserService;
    }

    getUserInfo(token) {
        return this.$q((resolve, reject) => {
            this.$http.get(`/api/slack/user?token=${token}`)
                .then(res => resolve(angular.extend({token: token}, res.data)))
                .catch(reject);
        });
    }

    postMessage(data) {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(user => {
                    data.token = user.token;

                    this.$http({
                        method: 'POST',
                        url: 'https://slack.com/api/chat.postMessage',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        data: $.param(data)
                    }).then(res => {
                        if (res.data.ok) {
                            resolve(res.data);
                        } else {
                            reject('Slack denied our request to post a message');
                            this.$log.error(res.data);
                        }
                    }).catch(res => {
                        reject('Error posting message');
                        this.$log.error(res);
                    });
                })
                .catch(() => reject('No authorized user found'));
        });
    }

    openIM(userId) {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(user => {
                    this.$http({
                        method: 'GET',
                        url: 'https://slack.com/api/im.open',
                        params: {
                            token: user.token,
                            user: userId
                        }
                    }).then(res => {
                        if (res.data.ok) {
                            resolve(res.data.channel.id);
                        } else {
                            reject('Slack denied our request to open an IM channel');
                        }
                    }).catch(res => {
                        this.$log.error(res);
                        reject('Error opening IM channel');
                    });
                })
                .catch(() => reject('No authenticated user found'));
        });
    }

    getData() {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(user => {
                    this.$http.get(`/api/slack?token=${user.token}`)
                        .then(res => resolve(res.data))
                        .catch(() => reject('Error getting Slack data'));
                })
                .catch(() => reject('No authenticated user found'));
        });
    }
}).name;
