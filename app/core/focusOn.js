'use strict';

export default class FocusOn {
    /*@ngInject*/
    constructor($timeout) {
        this.$timeout = $timeout;

        this.restrict = 'A';
    }

    link(scope, element, attr) {
        scope.$watch(attr.focusOn, val => {
            this.$timeout(() => {
                if (val) {
                    element.focus();
                } else {
                    element.blur();
                }
            });
        });
    }
}
