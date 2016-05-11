import { TokenService } from './token.service';

export default angular.module('slackbots.token', ['angular-storage'])
.service('TokenService', TokenService);
