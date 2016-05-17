import { UserService } from './user.service';

describe(UserService, () => {

    let _userService;
    let $rootScope;

    beforeEach(angular.mock.module(UserService));

    beforeEach(angular.mock.inject((_UserService_, _$rootScope_) => {
        _userService = _UserService_;
        $rootScope = _$rootScope_;
    }));

    describe('when no authenticated user', () => {
        beforeEach(() => delete _userService.user);

        it('should not authenticate', done => {
            expect(_userService.isAuthenticated()).to.be.false;
            done();
        });

        it('should reject the getUser promise', done => {
            expect(_userService.getUser()).to.be.rejected.notify(done);
            $rootScope.$digest();
        });
    });

    describe('when user authenticates', () => {
        let mockUser = { name: 'test', id: 1 };

        it('should set the user and return user asynchronously', done => {
            expect(_userService.setUser(mockUser)).to.eventually.become(mockUser).notify(done);
            expect(_userService.isAuthenticated()).to.be.true;
            $rootScope.$digest();
        });

        it('should resolve the getUser promise', done => {
            expect(_userService.getUser()).to.eventually.become(mockUser).notify(done);
            $rootScope.$digest();
        });
    });

});
