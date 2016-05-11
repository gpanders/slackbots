import HomeTemplate from './home.template.html';
import { HomeCtrl } from './home.controller';

export default {
    url: '/',
    template: HomeTemplate,
    controller: 'HomeCtrl',
    controllerAs: 'vm'
};
