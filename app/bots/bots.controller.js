import { Bot } from './bots.class';

export class BotsCtrl {
    /*@ngInject*/
    constructor($q, BotsService, UserService, SlackService) {
        this.$q = $q;
        this.botsService = BotsService;
        this.userService = UserService;
        this.slackService = SlackService;

        this.modal = {};

        this.botsService.getAll().then(bots => this.bots = bots);
        this.slackService.getData('users').then(users => this.users = users);
        this.slackService.getData('groups').then(groups => this.groups = groups);
        this.slackService.getData('channels').then(channels => this.channels = channels);

        this.sortOpts = {
            stop: () => this.botsService.updateIndices()
        };
    }

    newBot() {
        this.botsService.create(new Bot())
            .then(bot => this.bots.unshift(bot))
            .catch(res => console.error('Failed to add new bot', res));
    }

    save(bot) {
        if (bot.isUser) {
            return;
        }

        this.botsService.update(bot)
            .catch(res => console.error('Failed to save bot', res));
    }

    delete(bot) {
        this.botsService.delete(bot._id)
            .then(() => {
                let pos = this.bots.indexOf(bot);
                this.bots.splice(pos, 1);
            })
            .catch(res => console.error('Failed to delete bot', res));
    }

    send(bot) {
        this.userService.getUser()
            .then(user => {
                let channel = bot.channel;
                let message = bot.message;
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
    }


    openModal(field) {
        this.modal.field = field;
        this.imageUrlValue = field.imageUrl;
    }

    editBotImage(bot) {
        this.openModal(bot);
    }

    editAttachmentImage(bot) {
        this.openModal(bot.attachments);
    }

    modalSubmit(url) {
        this.modal.field.imageUrl = url;
        if (this.modal.field.hasOwnProperty('unsaved')) {
            this.modal.field.unsaved = true;
        }
    }
}
