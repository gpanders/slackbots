import { HomeController } from './home.controller';

import './home.module.scss';

export const HomeModule = angular.module('slackbots.home', [
    HomeController
]).name;
