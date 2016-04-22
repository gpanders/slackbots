'use strict';


export class HomeCtrl {
    /*@ngInject*/
    constructor($rootScope, $state, SlackService, TokenService, UserService, BotsService) {
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.SlackService = SlackService;
        this.TokenService = TokenService;
        this.UserService = UserService;
        this.BotsService = BotsService;

        this.loaded = false;
        this.modal = {};

        let token = this.TokenService.get();
        if (token) {
            this.checkToken(token);
        } else {
            this.loaded = true;
        }
    }

    checkToken(token) {
        this.SlackService.authorize(token).then(user => {
            this.user = user;
            this.UserService.setUser(user);
            this.TokenService.save(token);
            this.authMessage = 'Authorized! Loading bots...';
            this.loaded = true;

            this.$state.go('bots').then(() => {
                this.authMessage = '';
            });
        }, err => {
            delete this.user;
            this.TokenService.clear();
            this.UserService.removeUser();
            this.authMessage = 'Authorization failed: ' + err;
            this.loaded = true;
        });
    }

    signOut() {
        delete this.user;
        this.TokenService.clear();
        this.BotsService.bots = [];
        this.UserService.removeUser();
        this.$state.go('default');
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
