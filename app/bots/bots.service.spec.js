import Bots from './bots.module';
import { BotsService } from './bots.service';
import { Bot } from './bots.class';

describe(BotsService.name, () => {

    let $httpBackend, $rootScope, $q, BotsService, UserService, SlackService;
    let bots = [];
    let user = { id: 123 };

    beforeEach(angular.mock.module(Bots.name));

    beforeEach(() => {
        angular.mock.module($provide => {
            $provide.service('SlackService', class SlackService {
                constructor() {}
                getUserInfo(userId) {
                    return $q.resolve(user);
                }
            });
        });
    });

    beforeEach(angular.mock.inject((_BotsService_, _UserService_, _$httpBackend_, _$rootScope_, _$q_) => {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        $q = _$q_;
        BotsService = _BotsService_;
        UserService = _UserService_;

        UserService.setUser(user);

        $httpBackend.whenPOST('/bots/create').respond((method, url, data) => {
            let bot = angular.fromJson(data);
            if (angular.isUndefined(bot._id)) {
                bot._id = Math.floor(Math.random() * 1000000);
            }
            bots.push(bot);
            return [200, bot, {}];
        });

        $httpBackend.whenPUT(/\/bots\/update\?id=\d+/).respond((method, url, data) => {
            data = angular.fromJson(data);
            let botId = +(url.match(/\/bots\/update\?id=(\d+)/) || [])[1];
            let returnBot = null;
            bots.filter(bot => bot._id === botId).forEach(bot => {
                bot.botname = data.botname;
                bot.index = data.index;
                returnBot = bot;
            });
            return [200, returnBot, {}];
        });

        $httpBackend.whenGET(/\/bots\/list\?userId=\d+/).respond((method, url) => {
            let userId = +(url.match(/\/bots\/list\?userId=(\d+)/) || [])[1];
            let userBots = bots.filter(bot => bot.userId === +userId);
            return [200, userBots, {}];
        });

        $httpBackend.whenDELETE(/\/bots\/delete\?id=\d+/).respond((method, url) => {
            let botId = +(url.match(/\/bots\/delete\?id=(\d+)/) || [])[1];
            let returnBot = bots.filter(bot => bot._id === botId)[0];
            bots = bots.filter(bot => bot._id !== botId);
            return [200, returnBot, {}];
        });
    }));

    it('should create a new bot', done => {
        $httpBackend.expectPOST('/bots/create');
        let newBot = new Bot();
        BotsService.create(newBot).then(bot => {
            expect(angular.isDefined(bot._id)).to.equal(true);
            expect(bot.userId).to.equal(user.id);
            expect(bot.botname).to.equal(newBot.botname);
            expect(bot.index).to.equal(newBot.index);
            done();
        });
        $httpBackend.flush();
    });

    it('should return newly created bot', done => {
        $httpBackend.expectGET(`/bots/list?userId=${user.id}`);
        let userBots = bots.filter(bot => bot.userId === user.id);
        BotsService.getAll().then(bots => {
            expect(bots.filter(bot => !bot.isUser)).to.have.lengthOf(userBots.length); // plus 1 to account for the actual, non-bot User
            done();
        });
        $httpBackend.flush();
    });

    it('should be able to update a bot', () => {
        let update = bots[0];
        $httpBackend.expectPUT(`/bots/update?id=${update._id}`);
        update.index++;
        BotsService.update(update).then(bot => {
            expect(bot._id).to.equal(update._id);
            expect(bot.botname).to.equal(update.botname);
            expect(bot.index).to.equal(update.index);
        });
        $httpBackend.flush();
    });

    it('should be able to delete a bot', () => {
        let id = bots[0]._id;
        $httpBackend.expectDELETE(`/bots/delete?id=${id}`);
        BotsService.delete(id).then(bot => {
            expect(bot._id).to.equal(id);
        });
        $httpBackend.flush();
    });

    it('should not return a bot after deleting', () => {
        $httpBackend.expectGET(`/bots/list?userId=${user.id}`);
        BotsService.getAll().then(bots => {
            expect(bots.filter(bot => !bot.isUser).length).to.equal(0);
        });
        $httpBackend.flush();
    });

    it('should not return any bots if no authenticated user', done => {
        UserService.removeUser();
        expect(BotsService.getAll()).to.be.rejected.notify(done);
        $rootScope.$digest();
    });
});
