import { BotsController } from './bots.controller';

import './bots.module.scss';

export const BotsModule = angular.module('slackbots.bots', [
    'ui.sortable',
    BotsController
]).name;
