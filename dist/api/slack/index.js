const express = require('express');
const SlackBot = require('slackbots');
const Logger = require('../../lib/logger');

const NODE_ENV = process.env.NODE_ENV || 'development';

let log = new Logger(NODE_ENV === 'production' ? 4 : (NODE_ENV === 'development' ? 1 : 2));
let router = express.Router();

/**
 * @api {get} /api/slack Get channels, groups, and users from Slack
 * @apiName GetSlackInfo
 * @apiGroup Slack
 *
 * @apiSuccess {Object} channels Hash of channel ids to channel names
 * @apiSuccess {Object} groups Hash of group ids to group names
 * @apiSuccess {Object} users Hash of user ids to user names
 */
router.get('', (req, res) => {
    try {
        let bot = new SlackBot({ token: req.query.token });
        log.debug('Retrieving Slack information');

        let slack = {
            channels: {},
            groups: {},
            users: {}
        };

        bot.on('error', err => {
            log.error(err);
            res.status(500).end(err);
            bot.close();
        });

        bot.on('start', () => {
            Promise.all([bot.getChannels(), bot.getGroups(), bot.getUsers()])
                .then(values => {
                    values[0].channels
                        .filter(channel =>
                            channel['is_channel'] && channel['is_member'])
                        .forEach(channel =>
                            { slack.channels[channel.id] = `#${channel.name}`; });

                    values[1].groups
                        .filter(group =>
                            group['is_group'] &&
                            !group['is_archived'] &&
                            group['is_open'] &&
                            !group['is_mpim'])
                        .forEach(group =>
                            { slack.groups[group.id] = group.name; });

                    values[2].members
                        .filter(member =>
                            !member.deleted && !member['is_bot'])
                        .forEach(member =>
                            { slack.users[member.id] = `@${member.name}`; });

                    log.debug(`Found ${Object.keys(slack.channels).length} channels, ${Object.keys(slack.groups).length} groups, and ${Object.keys(slack.users).length} users`);
                    return res.json(slack);
                })
                .catch(e => res.status(500).end(e))
                .then(() => bot.close());
        });
    } catch (e) {
        log.error(e);
        return res.status(500).end(e);
    }
});

/**
 * @api {get} /api/slack/user Get user info from token
 * @apiName GetUserInfo
 * @apiGroup Slack
 *
 * @apiSuccess {String} id User ID
 * @apiSuccess {String} name User's username
 * @apiSuccess {String} realName User's real name
 * @apiSuccess {String} imageUrl URL of user's profile image
 */
router.get('/user', (req, res) => {
    log.debug('Looking up user info');
    try {
        let bot = new SlackBot({ token: req.query.token });

        bot.on('start', () => {
            bot.getUser(bot.self.name)
                .then(user => {
                    log.debug(`Returning user info for ${bot.self.name}`);
                    return res.json({
                        id: bot.self.id,
                        name: bot.self.name,
                        realName: user.profile['real_name'],
                        imageUrl: user.profile['image_original']
                    });
                })
                .catch(() => res.status(500).end())
                .then(() => bot.close());
        });
    } catch (e) {
        log.error(e);
        return res.status(500).end(e);
    }
});

module.exports = router;
