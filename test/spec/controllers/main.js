'use strict';

describe('Controller: MainCtrl', function () {
    beforeEach(module('slackbotsApp'));

    var createController, $rootScope, $scope, $q, $state, $cookies, SlackFactory, deferred;

    var cookieName = 'slackbotsAppToken';
    var token = 'asdf';

    var user = {
      id: 1,
      token: token,
      username: 'Test'
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, _$rootScope_, _$q_, _$state_, _$cookies_, _SlackFactory_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $state = _$state_;
        $cookies = _$cookies_;
        SlackFactory = _SlackFactory_;

        deferred = $q.defer();

        spyOn(SlackFactory, 'authorize').and.returnValue(deferred.promise);
        spyOn($state, 'go').and.returnValue($q.defer().promise);
        spyOn($cookies, 'put');

        createController = function() {
            $controller('MainCtrl', {
                $scope: $scope,
                $state: $state,
                $cookies: $cookies,
                SlackFactory: SlackFactory
            });
            $scope.$digest();
        };
    }));

    it('should read cookie if it exists and not be done loading', function() {
        spyOn($cookies, 'get').and.returnValue(token);
        createController();

        expect($cookies.get).toHaveBeenCalledWith(cookieName);
        expect($scope.loaded).toBe(false);
    });

    it('should be done loading if cookie does not exist', function() {
        spyOn($cookies, 'get').and.returnValue(null);
        createController();

        expect($cookies.get).toHaveBeenCalledWith(cookieName);
        expect($scope.loaded).toBe(true);
    });

    it('should authorize user with valid token', function() {
        deferred.resolve(user);
        createController();

        $scope.checkToken(token);
        $scope.$apply();

        // Expect SlackFactory to authorize correct token
        expect(SlackFactory.authorize).toHaveBeenCalledWith(token);

        // Expect cookie to have been set after Authorization
        expect($cookies.put).toHaveBeenCalledWith(cookieName, token);

        // Expect user in root scope to be the one we resolved
        expect($rootScope.user.id).toBe(user.id);
        expect($rootScope.user.token).toBe(token);
        expect($rootScope.user.username).toBe(user.username);

        // Expect state to change to 'bots'
        expect($state.go).toHaveBeenCalledWith('bots');
    });

});
