import User from '../user/user.module';
import Token from '../token/token.module';
import Slack from '../slack/slack.module';
import Bots from '../bots/bots.module';

import { HomeCtrl } from './home.controller';

import './home.styles';

export default angular.module('slackbots.home', [
    User.name,
    Token.name,
    Slack.name,
    Bots.name
])
.controller('HomeCtrl', HomeCtrl);
