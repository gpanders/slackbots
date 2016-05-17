import { HomeController } from './home.controller';

export const HomeState = {
    url: '/',
    template: require('./home.module.html'),
    controller: HomeController,
    controllerAs: 'vm'
};
