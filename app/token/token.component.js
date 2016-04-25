import { TokenService } from './token.service';

export default angular.module('slackbots.token', [])
.service(TokenService.name, TokenService);
