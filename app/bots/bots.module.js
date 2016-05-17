import { BotsController } from './bots.controller';

import './bots.module.scss';

export const BotsModule = angular.module('slackbots.bots', [
    BotsController
]).name;
