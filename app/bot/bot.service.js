import { UserService } from '../user';
import { SlackService } from '../slack';

export const BotService = angular.module('BotService', [
    UserService,
    SlackService
])
.service('BotService', class BotService {
    /*@ngInject*/
    constructor($http, $q, $log, UserService, SlackService) {
        this.$http = $http;
        this.$q = $q;
        this.$log = $log;
        this.userService = UserService;
        this.slackService = SlackService;

        this.bots = [];
    }

    _handleError(reject) {
        this.bots = [];
        return () => reject('No authenticated user found');
    }

    updateIndices() {
        this.bots.forEach((bot, i) => {
            if (bot.index !== i) {
                bot.index = i;
                if (bot._id) { this.update(bot); }
            }
        });
    }

    getAll() {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(user => {
                    if (this.bots.length) {
                        resolve(this.bots);
                    } else {
                        this.$http.get(`/api/bots?userId=${user.id}`)
                            .then(res => {
                                this.bots = res.data;
                                this.bots.unshift({
                                    isUser: true,
                                    botname: user.realName,
                                    imageUrl: user.imageUrl
                                });
                                resolve(this.bots);
                            })
                            .catch(reject);
                    }
                })
                .catch(this._handleError(reject));
        });
    }

    create(bot) {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(user => {
                    bot.userId = user.id;

                    this.$http.post('/api/bots', bot)
                        .then(res => {
                            this.bots.unshift(bot);
                            this.updateIndices();
                            resolve(res.data);
                        })
                        .catch(reject);
                })
                .catch(this._handleError(reject));
        });
    }

    update(bot) {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(user => {
                    bot.userId = user.id;

                    this.$http.put(`/api/bots/${bot._id}`, bot)
                        .then(res => resolve(res.data))
                        .catch(reject);
                })
                .catch(this._handleError(reject));
        });
    }

    delete(id) {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(() => {
                    this.$http.delete(`/api/bots/${id}`)
                        .then(res => resolve(res.data))
                        .catch(reject);
                })
                .catch(this._handleError(reject));
        });
    }

    send(bot, message) {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(user => {
                    let url = bot.isUser ?
                        '/api/slack/send' :
                        `/api/bots/${bot._id}/send`;

                    this.$http.post(url, {
                        token: user.token,
                        message: message,
                        channel: bot.channel
                    })
                    .then(res => resolve(res.data))
                    .catch(reject);
                })
                .catch(this._handleError(reject));
        });
    }
}).name;
