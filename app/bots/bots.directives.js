'use strict';

module.exports = angular.module('slackbots.botsDirectives', [])
.directive('focusOn', function($timeout) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attr) {
            $scope.$watch($attr.focusOn, function(_focusVal) {
                $timeout(function() {
                    if (_focusVal) {
                        $element.focus();
                    } else {
                        $element.blur();
                    }
                });
            });
        }
    };
});
