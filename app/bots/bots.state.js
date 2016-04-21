module.exports = {
    url: '/',
    template: require('./bots.template.html'),
    controller: 'BotsCtrl',
    resolve: {
        user: function($rootScope, SlackFactory) {
            return SlackFactory.getUserInfo($rootScope.user.id);
        },
        bots: function(BotFactory) {
            return BotFactory.getAll();
        },
        users: function(SlackFactory) {
            return SlackFactory.getData('users');
        },
        channels: function(SlackFactory) {
            return SlackFactory.getData('channels');
        },
        groups: function(SlackFactory) {
            return SlackFactory.getData('groups');
        },
    }
};
