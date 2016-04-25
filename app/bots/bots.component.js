import './bots.styles';

import { BotsCtrl } from './bots.controller';
import { BotsService } from './bots.service';

export default angular.module('slackbots.bots', [])
.controller(BotsCtrl.name, BotsCtrl)
.service(BotsService.name, BotsService);
