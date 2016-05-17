import { SlackService } from '../slack';
import { BotService } from './bot.service';
import { Bot } from './bot';

describe(BotService, () => {

    let $httpBackend, $rootScope, $q, _botService, _userService;
    let bots = [];

    let user = {
        token: 'abcdefg12345',
        id: '123',
        name: 'test',
        realName: 'Test McTest',
        imageUrl: ''
    };

    beforeEach(angular.mock.module(BotService));

    beforeEach(() => {
        angular.mock.module($provide => {
            $provide.service(SlackService, class {
                constructor() {}
                getUserInfo(userId) {
                    return $q.resolve(user);
                }
            });
        });
    });

    beforeEach(angular.mock.inject((_BotService_, _UserService_, _$httpBackend_, _$rootScope_, _$q_) => {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        $q = _$q_;
        _botService = _BotService_;
        _userService = _UserService_;

        _userService.setUser(user);

        $httpBackend.whenPOST(/^\/api\/bots$/)
            .respond((method, url, data, headers, params) => {
                let bot = angular.fromJson(data);
                if (angular.isUndefined(bot._id)) {
                    bot._id = String(Math.floor(Math.random() * 1000000));
                }
                bots.push(bot);
                return [200, bot, {}];
            });

        $httpBackend.whenPOST(/^\/api\/bots\/(.+)\/send$/, undefined, undefined, ['id'])
            .respond((method, url, data, headers, params) => {
                data = angular.fromJson(data);
                let botId = params.id;
                let token = data.token;
                let message = data.message;
                let bot = bots.filter(bot => bot._id === botId)[0];

                if (!token || !message) {
                    return [400, {}, {}];
                } else if (!bot) {
                    return [404, {}, {}];
                } else {
                    return [200, message, {}];
                }
            });

        $httpBackend.whenPUT(/^\/api\/bots\/(.+)$/, undefined, undefined, ['id'])
            .respond((method, url, data, headers, params) => {
                data = angular.fromJson(data);
                let botId = params.id;
                let returnBot = null;
                bots.filter(bot => bot._id === botId).forEach(bot => {
                    bot.botname = data.botname;
                    bot.index = data.index;
                    returnBot = bot;
                });
                return [200, returnBot, {}];
            });

        $httpBackend.whenGET(/^\/api\/bots\?userId=(.+)$/, undefined, undefined, ['userId'])
            .respond((method, url, data, headers, params) => {
                let userId = params.userId;
                let userBots = bots.filter(bot => bot.userId === userId);
                return [200, userBots, {}];
            });

        $httpBackend.whenDELETE(/^\/api\/bots\/(.+)$/, undefined, ['id'])
            .respond((method, url, data, headers, params) => {
                let botId = params.id;
                if (!botId) {
                    return [400, {}, {}];
                }

                let returnBot = bots.filter(bot => bot._id === botId)[0];
                if (!returnBot) {
                    return [404, {}, {}];
                }

                bots = bots.filter(bot => bot._id !== botId);
                return [200, returnBot, {}];
            });
    }));

    afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should create a new bot', done => {
        $httpBackend.expectPOST('/api/bots');
        let newBot = new Bot();
        newBot.botname = 'Test Bot';
        newBot.channel = 'U12345';
        _botService.create(newBot).then(bot => {
            expect(angular.isDefined(bot._id)).to.equal(true);
            expect(bot.userId).to.equal(user.id);
            expect(bot.botname).to.equal(newBot.botname);
            expect(bot.index).to.equal(newBot.index);
            expect(bot.channel).to.equal(newBot.channel);
            done();
        });
        $httpBackend.flush();
    });

    it('should return newly created bot', done => {
        $httpBackend.expectGET(`/api/bots?userId=${user.id}`);
        let userBots = bots.filter(bot => bot.userId === user.id);
        _botService.getAll()
            .then(bots => bots.filter(bot => !bot.isUser)).should.eventually.have.lengthOf(userBots.length).notify(done);
        $httpBackend.flush();
    });

    it('should be able to update a bot', done => {
        let update = bots[0];
        $httpBackend.expectPUT(`/api/bots/${update._id}`);
        update.index++;
        _botService.update(update).should.eventually.become(update).notify(done);
        $httpBackend.flush();
    });

    it('should send a message', done => {
        let bot = bots[0];
        $httpBackend.expectPOST(`/api/bots/${bot._id}/send`);
        _botService.send(bot, 'Test message').should.be.fulfilled.notify(done);
        $httpBackend.flush();
    });

    it('should be able to delete a bot', () => {
        let id = bots[0]._id;
        $httpBackend.expectDELETE(`/api/bots/${id}`);
        _botService.delete(id).then(bot => bot._id).should.eventually.equal(id);
        $httpBackend.flush();
    });

    it('should not return a bot after deleting', () => {
        $httpBackend.expectGET(`/api/bots?userId=${user.id}`);
        _botService.getAll().then(bots => bots.filter(bot => !bot.isUser)).should.eventually.have.lengthOf(0);
        $httpBackend.flush();
    });

    it('should not return any bots if no authenticated user', done => {
        _userService.removeUser();
        _botService.getAll().should.be.rejected.notify(done);
        $rootScope.$digest();
    });

});
