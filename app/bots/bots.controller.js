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
        this.slackService.getData().then(data => {
            this.channels = data.channels;
            this.groups = data.groups;
            this.users = data.users;
        });

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
        let message = bot.message;
        bot.message = '';
        this.botsService.send(bot, message)
            .then(res => console.log(res))
            .catch(res => console.error(res));
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
