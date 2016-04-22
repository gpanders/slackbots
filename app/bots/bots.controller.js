'use strict';

export class BotsCtrl {
    /*@ngInject*/
    constructor($q, BotsService, UserService, SlackService) {
        this.$q = $q;
        this.BotsService = BotsService;
        this.UserService = UserService;
        this.SlackService = SlackService;

        BotsService.getAll().then(bots => this.bots = bots);
        SlackService.getData('users').then(users => this.users = users);
        SlackService.getData('groups').then(groups => this.groups = groups);
        SlackService.getData('channels').then(channels => this.channels = channels);

        this.sortOpts = {
            stop: () => this.BotsService.updateIndices()
        };
    }

    newBot() {
        let newBot = { botname: 'NewBot', index: 0 };
        this.BotsService.create(newBot).then(() => {}, res => {
            console.error('Failed to add new bot', res);
        });
    }

    save(bot) {
        if (bot.isUser) {
            return;
        }

        this.BotsService.update(bot).then(() => {}, res => {
            console.error('Failed to save bot', res);
        });
    }

    delete(bot) {
        if (confirm('Are you sure you want to delete this bot?')) {
            this.BotsService.delete(bot._id).then(() => {
                let pos = this.bots.indexOf(bot);
                this.bots.splice(pos, 1);
            }, res => {
                console.error('Failed to delete bot', res);
            });
        }
    }

    send(bot) {
        this.UserService.getUser().then(user => {
            let deferred = this.$q.defer();
            let channel = bot.channel;
            let message = bot.message;
            bot.message = '';
            if (bot.type === 'user') {
                // channel is user ID
                if (!bot.postAsSlackbot) {
                    if (this.users[channel].im) {
                        deferred.resolve(this.users[channel].im);
                    } else {
                        this.SlackService.openIM(channel).then(deferred.resolve);
                    }
                } else {
                    deferred.resolve(channel);
                }
            } else {
                deferred.resolve(channel);
            }

            deferred.promise.then(channel => {
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

                this.SlackService.postMessage(data).then(() => {}, res => {
                    console.error(res);
                });
            });
        });
    }
}
