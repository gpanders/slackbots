import { Bot, BotService } from '../bot';
import { UserService } from '../user';
import { SlackService } from '../slack';
import { FocusOn } from '../shared/focusOn';

export const BotsController = angular.module('BotsController', [
    BotService,
    UserService,
    SlackService
])
.directive('focusOn', FocusOn)
.controller('BotsController', class BotsController {
    /*@ngInject*/
    constructor($q, $log, BotService, UserService, SlackService) {
        this.$q = $q;
        this.$log = $log;
        this.botService = BotService;
        this.userService = UserService;
        this.slackService = SlackService;

        this.modal = {};

        this.botService.getAll().then(bots => this.bots = bots);
        this.slackService.getData().then(data => {
            this.channels = data.channels;
            this.groups = data.groups;
            this.users = data.users;
        });

        this.sortOpts = {
            stop: () => this.botService.updateIndices()
        };
    }

    newBot() {
        this.botService.create(new Bot())
            .then(bot => this.bots.unshift(bot))
            .catch(res => this.$log.error('Failed to add new bot', res));
    }

    save(bot) {
        if (bot.isUser) {
            return;
        }

        this.botService.update(bot)
            .catch(res => this.$log.error('Failed to save bot', res));
    }

    delete(bot) {
        this.botService.delete(bot._id)
            .then(() => {
                let pos = this.bots.indexOf(bot);
                this.bots.splice(pos, 1);
            })
            .catch(res => this.$log.error('Failed to delete bot', res));
    }

    send(bot) {
        let message = bot.message;
        bot.message = '';
        this.botService.send(bot, message)
            .then(res => this.$log.debug(res))
            .catch(res => this.$log.error(res));
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
}).name;
