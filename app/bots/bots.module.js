import User from '../user/user.module';
import Slack from '../slack/slack.module';

import { BotsCtrl } from './bots.controller';
import { BotsService } from './bots.service';

import './bots.styles';

export default angular.module('slackbots.bots', [Slack.name, User.name])
.controller('BotsCtrl', BotsCtrl)
.service('BotsService', BotsService);
