import { BotsController } from './bots.controller';

export const BotsState = {
    url: '',
    template: require('./bots.module.html'),
    controller: BotsController,
    controllerAs: 'vm'
};
