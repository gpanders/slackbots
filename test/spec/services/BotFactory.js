'use strict';

describe('BotFactory', function() {
    beforeEach(module('slackbotsApp'));


    var $httpBackend, BotFactory, $rootScope;
    var bots = [];

    beforeEach(inject(function(_BotFactory_, _$httpBackend_, _$rootScope_) {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        BotFactory = _BotFactory_;

        $rootScope.user = { id: 1 };

        $httpBackend.whenPOST('/bots/create').respond(function(method, url, data) {
            var bot = angular.fromJson(data);
            bots.push(bot);
            return [200, bot, {}];
        });

        $httpBackend.whenPUT(/\/bots\/update\?id=\d+/).respond(function(method, url, data) {
            data = angular.fromJson(data);
            var botId = (url.match(/\/bots\/update\?id=(\d+)/) || [])[1];
            var returnBot = null;
            bots.forEach(function(bot) {
                if (bot._id == botId) {
                    bot.botname = data.botname;
                    bot.index = data.index;
                    returnBot = bot;
                }
            });
            return [200, returnBot, {}];
        });

        $httpBackend.whenGET(/\/bots\/list\?userId=\d+/).respond(function(method, url) {
            var userId = (url.match(/\/bots\/list\?userId=(\d+)/) || [])[1];
            var userBots = bots.filter(function(bot) {
                return bot.userId == userId;
            });
            return [200, userBots, {}];
        });

        $httpBackend.whenDELETE(/\/bots\/delete\?id=\d+/).respond(function(method, url) {
            var botId = (url.match(/\/bots\/delete\?id=(\d+)/) || [])[1];
            var returnBot = null;
            bots.forEach(function(bot, i) {
                if (bot._id == botId) {
                    returnBot = bots.splice(i, 1)[0];
                    return false;
                }
            });
            return [200, returnBot, {}];
        });
    }));

    it('should create a new bot', function() {
        $httpBackend.expectPOST('/bots/create');
        var newBot = { _id: 123, userId: 1, botname: 'NewBot', index: 0 };
        BotFactory.create(newBot).then(function(bot) {
            expect(bot._id).toBe(newBot._id);
            expect(bot.userId).toBe(newBot.userId);
            expect(bot.botname).toBe(newBot.botname);
            expect(bot.index).toBe(newBot.index);
        });
        $httpBackend.flush();
    });

    it('should return newly created bot', function() {
        $httpBackend.expectGET('/bots/list?userId=1');
        var userBots = bots.filter(function(bot) {
            return bot.userId == 1;
        });
        BotFactory.getAll().then(function(bots) {
            expect(bots.length).toBe(userBots.length);
            for (var i=0; i < bots.length; i++) {
                expect(bots[i]._id).toBe(userBots[i]._id);
                expect(bots[i].userId).toBe(userBots[i].userId);
                expect(bots[i].botname).toBe(userBots[i].botname);
                expect(bots[i].index).toBe(userBots[i].index);
            }
        });
        $httpBackend.flush();
    });

    it('should be able to update a bot', function() {
        $httpBackend.expectPUT('/bots/update?id=123');
        var update = { _id: 123, botname: 'UpdatedBot', index: 2 };
        BotFactory.update(update).then(function(bot) {
            expect(bot._id).toBe(update._id);
            expect(bot.botname).toBe(update.botname);
            expect(bot.index).toBe(update.index);
        });
        $httpBackend.flush();
    });

    it('should be able to delete a bot', function() {
        $httpBackend.expectDELETE('/bots/delete?id=123');
        var id = 123;
        BotFactory.delete(id).then(function(bot) {
            expect(bot._id).toBe(id);
        });
        $httpBackend.flush();
    });

    it('should not return a bot after deleting', function() {
        $httpBackend.expectGET('/bots/list?userId=1');
        BotFactory.getAll().then(function(bots) {
            expect(bots.length).toBe(0);
        });
        $httpBackend.flush();
    });
});
