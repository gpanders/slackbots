import User from './user.module';

describe('UserService', () => {

    let UserService;
    let $rootScope;

    beforeEach(angular.mock.module(User.name));

    beforeEach(angular.mock.inject((_UserService_, _$rootScope_) => {
        UserService = _UserService_;
        $rootScope = _$rootScope_;
    }));

    describe('when no authenticated user', () => {
        beforeEach(() => delete UserService.user);

        it('should not authenticate', done => {
            expect(UserService.isAuthenticated()).to.equal(false);
            done();
        });

        it('should reject the getUser promise', done => {
            expect(UserService.getUser()).to.be.rejected.notify(done);
            $rootScope.$digest();
        });
    });

    describe('when user authenticates', () => {
        let mockUser = { name: 'test', id: 1 };

        it('should set the user and return user asynchronously', done => {
            expect(UserService.setUser(mockUser)).to.eventually.become(mockUser).notify(done);
            expect(UserService.isAuthenticated()).to.equal(true);
            $rootScope.$digest();
        });

        it('should resolve the getUser promise', done => {
            expect(UserService.getUser()).to.eventually.become(mockUser).notify(done);
            $rootScope.$digest();
        });
    });

});
