export class BotsService {
    /*@ngInject*/
    constructor($http, $q, UserService, SlackService) {
        this.$http = $http;
        this.$q = $q;
        this.UserService = UserService;
        this.SlackService = SlackService;

        this.bots = [];
    }

    get name() {
        return 'BotsService';
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
        let deferred = this.$q.defer();

        this.UserService.getUser().then(user => {
            if (this.bots.length) {
                deferred.resolve(this.bots);
            } else {
                this.$http({
                    method: 'GET',
                    url: '/bots/list',
                    params: { userId: user.id }
                }).then(
                    res => {
                        this.bots = res.data;
                        this.SlackService.getUserInfo(user.id).then(userBot => {
                            this.bots.unshift({
                                isUser: true,
                                botname: userBot.realName,
                                imageUrl: userBot.imageUrl
                            });
                            deferred.resolve(this.bots);
                        });
                    },
                    res => {
                        console.error('Failed to get bot list');
                        deferred.reject(res);
                    }
                );
            }
        }, () => deferred.reject('No authenticated user found'));

        return deferred.promise;
    }

    create(bot) {
        let deferred = this.$q.defer();
        this.UserService.getUser().then(user => {
            bot.userId = user.id;

            this.$http({
                method: 'POST',
                url: '/bots/create',
                data: bot
            }).then(
                res => {
                    this.bots.unshift(bot);
                    this.updateIndices();
                    deferred.resolve(res.data);
                },
                res => deferred.reject(res)
            );
        }, () => deferred.reject('No authenticatd user found'));

        return deferred.promise;
    }

    update(bot) {
        let deferred = this.$q.defer();
        this.UserService.getUser().then(user => {
            bot.userId = user.id;

            this.$http({
                method: 'PUT',
                url: '/bots/update',
                params: { id: bot._id },
                data: bot
            }).then(
                res => deferred.resolve(res.data),
                res => deferred.reject(res)
            );
        }, () => deferred.reject('No autheticated user found'));
        return deferred.promise;
    }

    delete(id) {
        let deferred = this.$q.defer();
        this.UserService.getUser().then(() => {
            this.$http.delete('/bots/delete?id=' + id).then(
                res => deferred.resolve(res.data),
                res => deferred.reject(res)
            );
        }, () => deferred.reject('No authenticated user found'));
        return deferred.promise;
    }
}
