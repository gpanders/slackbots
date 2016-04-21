'use strict';

module.exports = angular.module('slackbots.tokenService', [])
.factory('TokenStore', function(store) {
    return store.getNamespacedStore('slackbots');
})
.factory('TokenService', function(TokenStore) {
    var s = {};

    s.get = function() {
        return TokenStore.get('token');
    };

    s.save = function(token) {
        return TokenStore.set('token', token);
    };

    s.clear = function() {
        return TokenStore.remove('token');
    };

    return s;
});
