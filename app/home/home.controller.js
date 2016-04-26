export class HomeCtrl {
    /*@ngInject*/
    constructor($state, SlackService, TokenService, UserService, BotsService) {
        this.$state = $state;
        this.slackService = SlackService;
        this.tokenService = TokenService;
        this.userService = UserService;
        this.botsService = BotsService;

        this.modal = {};

        let token = this.tokenService.get();

        this.loaded = !token;

        if (token) {
            this.checkToken(token);
        }
    }

    get name() {
        return 'HomeCtrl';
    }

    get authenticated() {
        return this.userService.isAuthenticated();
    }

    checkToken(token) {
        this.slackService.authorize(token)
            .then(user => {
                this.userService.setUser(user)
                    .then(user => this.user = user);
                this.tokenService.save(token);
                this.authMessage = 'Authorized! Loading bots...';
                this.loaded = true;

                this.$state.go('bots').then(() => {
                    this.authMessage = '';
                });
            })
            .catch(err => {
                this.tokenService.clear();
                this.userService.removeUser();
                this.authMessage = `Authorization failed: ${err}`;
                this.loaded = true;
            });
    }

    signOut() {
        this.botsService.bots = [];
        this.tokenService.clear();
        this.userService.removeUser();
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
