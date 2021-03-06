import { TokenService } from './token.service';

describe(TokenService, () => {

    let _tokenService;

    beforeEach(angular.mock.module(TokenService));

    beforeEach(angular.mock.inject((_TokenService_) => {
        _tokenService = _TokenService_;
    }));

    it('should retrieve the token after saving it', done => {
        let token = 'abcd1234';
        _tokenService.save(token);
        expect(_tokenService.get()).to.equal(token);
        done();
    });

    it('should retrieve null after token is cleared', done => {
        _tokenService.clear();
        expect(_tokenService.get()).to.be.null;
        done();
    });
});
