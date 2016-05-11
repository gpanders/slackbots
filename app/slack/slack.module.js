import User from '../user/user.module';

import { SlackService } from './slack.service';

export default angular.module('slackbots.slack', [User.name])
.service(SlackService.name, SlackService);
