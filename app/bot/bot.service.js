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
            if (bot.index !== +i) {
                bot.index = +i;
                this.update(bot);
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
                    this.$http.post(`/api/bots/${bot._id}/send`, {
                        postAsSlackbot: bot.postAsSlackbot,
                        token: user.token,
                        message: message
                    })
                    .then(res => resolve(res.data))
                    .catch(reject);
                })
                .catch(this._handleError(reject));
        });
                /*
                let promise = this.$q((resolve, reject) => {
                    bot.message = '';
                    if (bot.type === 'user') {
                        // channel is user ID
                        if (!bot.postAsSlackbot) {
                            if (this.users[channel].im) {
                                resolve(this.users[channel].im);
                            } else {
                                this.slackService.openIM(channel).then(resolve);
                            }
                        } else {
                            resolve(channel);
                        }
                    } else {
                        resolve(channel);
                    }
                });

                promise.then(channel => {
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

                    this.slackService.postMessage(data)
                        .catch(res => console.error(res));
                });
            });
            */
    }
}).name;
