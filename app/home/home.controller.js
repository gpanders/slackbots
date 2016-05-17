import { BotService } from '../bot';
import { SlackService } from '../slack';
import { UserService } from '../user';
import { TokenService } from '../token';

export const HomeController = angular.module('HomeController', [
    'ui.router',
    BotService,
    SlackService,
    UserService,
    TokenService
])
.controller('HomeController', class HomeController {
    /*@ngInject*/
    constructor($state, SlackService, TokenService, UserService, BotService) {
        this.$state = $state;
        this.slackService = SlackService;
        this.tokenService = TokenService;
        this.userService = UserService;
        this.botService = BotService;

        let token = this.tokenService.get();

        this.loaded = !token;

        if (token) {
            this.checkToken(token);
        }
    }

    get authenticated() {
        return this.userService.isAuthenticated();
    }

    checkToken(token) {
        this.slackService.getUserInfo(token)
            .then(user => {
                this.userService.setUser(user).then(user => this.user = user);
                this.tokenService.save(token);
                this.authMessage = 'Authorized! Loading bots...';
                this.loaded = true;

                this.$state.go('home.bots').then(() => {
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
        this.botService.bots = [];
        this.tokenService.clear();
        this.userService.removeUser();
        this.$state.go('home');
    }
}).name;
