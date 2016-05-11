export class BotsService {
    /*@ngInject*/
    constructor($http, $q, UserService, SlackService) {
        this.$http = $http;
        this.$q = $q;
        this.userService = UserService;
        this.slackService = SlackService;

        this.bots = [];
    }

    get name() {
        return 'BotsService';
    }

    _error(reject) {
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
                        this.$http({
                            method: 'GET',
                            url: '/bots/list',
                            params: { userId: user.id }
                        }).then(res => {
                            this.bots = res.data;
                            this.slackService.getUserInfo(user.id)
                                .then(userBot => {
                                    this.bots.unshift({
                                        isUser: true,
                                        botname: userBot.realName,
                                        imageUrl: userBot.imageUrl
                                    });
                                    resolve(this.bots);
                                });
                        }).catch(reject);
                    }
                })
                .catch(this._error(reject));
        });
    }

    create(bot) {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(user => {
                    bot.userId = user.id;

                    this.$http({
                        method: 'POST',
                        url: '/bots/create',
                        data: bot
                    }).then(res => {
                        this.bots.unshift(bot);
                        this.updateIndices();
                        resolve(res.data);
                    }).catch(reject);
                })
                .catch(this._error(reject));
        });
    }

    update(bot) {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(user => {
                    bot.userId = user.id;

                    this.$http({
                        method: 'PUT',
                        url: '/bots/update',
                        params: { id: bot._id },
                        data: bot
                    })
                    .then(res => resolve(res.data))
                    .catch(reject);
                })
                .catch(this._error(reject));
        });
    }

    delete(id) {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(() => {
                    this.$http.delete('/bots/delete?id=' + id)
                        .then(res => resolve(res.data))
                        .catch(reject);
                })
                .catch(this._error(reject));
        });
    }
}
