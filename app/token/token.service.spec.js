import Token from './token.module';

describe('TokenService', () => {

    let TokenService;
    let $rootScope;

    beforeEach(angular.mock.module(Token.name));

    beforeEach(angular.mock.inject((_TokenService_, _$rootScope_) => {
        TokenService = _TokenService_;
        $rootScope = _$rootScope_;
    }));

    it('should retrieve the token after saving it', done => {
        let token = 'abcd1234';
        TokenService.save(token);
        expect(TokenService.get()).to.equal(token);
        done();
    });

    it('should retrieve null after token is cleared', done => {
        TokenService.clear();
        expect(TokenService.get()).to.equal(null);
        done();
    });
});
