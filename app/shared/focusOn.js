export function FocusOn($timeout) {
    'ngInject';
    return {
        restrict: 'A',
        link: (scope, element, attr) => {
            scope.$watch(attr.focusOn, val => {
                $timeout(() => {
                    if (val) {
                        element.focus();
                    } else {
                        element.blur();
                    }
                });
            });
        }
    };
}
