import Home from './home.module';

describe('HomeCtrl', () => {

    let $rootScope, BotsService, UserService, TokenService, createController;

    let testToken = 'abcdefg123456';
    let user = { token: testToken, id: 123, name: 'test', realName: 'Test McTest', imageUrl: '' };

    beforeEach(angular.mock.module(Home.name));

    beforeEach(angular.mock.inject((_$rootScope_, $q, $controller, _BotsService_, _UserService_, _TokenService_) => {
        $rootScope = _$rootScope_;
        BotsService = _BotsService_;
        UserService = _UserService_;
        TokenService = _TokenService_;

        createController = () => $controller('HomeCtrl', {
            // Mock dependencies
            'SlackService': {
                getUserInfo: token => {
                    if (token === testToken) {
                        return $q.resolve(user);
                    } else {
                        return $q.reject();
                    }
                }
            },
            '$state': {
                go: () => $q.resolve()
            }
        });
    }));

    it('should verify and set the user if a valid token is present', done => {
        TokenService.save(testToken);
        let ctrl = createController();

        // Token is present, controller should not yet be loaded
        expect(ctrl.loaded).to.equal(false);

        // Process $q promises
        $rootScope.$digest();

        // Token is valid, user should be signed in
        expect(TokenService.get()).to.equal(testToken);
        expect(UserService.isAuthenticated()).to.equal(true);
        expect(UserService.getUser()).to.eventually.become(user).notify(done);

        // Controller should now be loaded
        expect(ctrl.loaded).to.equal(true);

        // Process $q promises
        $rootScope.$digest();
    });

    it('should remove a signed in user if an invalid token is present', done => {
        TokenService.save('invalid_token');
        UserService.setUser(user); // create a signed in user
        let ctrl = createController();

        // Token is present, controller should not yet be loaded
        expect(ctrl.loaded).to.equal(false);

        $rootScope.$digest();

        // Token is invalid, there should be no authenticated user
        expect(TokenService.get()).to.equal(null);
        expect(UserService.isAuthenticated()).to.equal(false);
        expect(UserService.getUser()).to.be.rejected.notify(done);

        // Controller should now be loaded
        expect(ctrl.loaded).to.equal(true);

        // Process $q promises
        $rootScope.$digest();
    });

    it('should be finished loading if no token is present', done => {
        TokenService.clear();
        let ctrl = createController();

        // No token is present, controller should be loaded
        expect(ctrl.loaded).to.equal(true);
        done();
    });

    it('should remove any signed in user when signOut() is called', done => {
        // Spoof a signed in user
        TokenService.save(testToken);
        UserService.setUser(user);

        // Create controller
        let ctrl = createController();

        // Sign out
        ctrl.signOut();

        // Make sure user is properly signed out
        expect(TokenService.get()).to.equal(null);
        expect(UserService.isAuthenticated()).to.equal(false);
        expect(UserService.getUser()).to.be.rejected.notify(done);
        expect(BotsService.bots).to.have.lengthOf(0);

        // Process $q promises
        $rootScope.$digest();
    });

});
