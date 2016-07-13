const express = require('express');
const WebClient = require('@slack/client').WebClient;

let logger = require('../../lib/helpers').getLogger();
let requireParams = require('../../lib/helpers').requireParams;

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
    let missingParams = requireParams(['token'], req);
    if (missingParams) {
        return res.status(400).end(missingParams);
    }

    let token = req.query.token;

    try {
        let web = new WebClient(token);

        web.auth.test().then(user => {
            logger.debug(`Retrieving Slack information for ${user.user}`);

            let slack = {
                channels: [],
                groups: [],
                users: []
            };

            return Promise.all([web.channels.list(), web.groups.list(), web.users.list()])
                .then(values => {
                    values[0].channels
                        .filter(channel =>
                            channel['is_channel'] && channel['is_member'])
                        .forEach(channel => slack.channels.push({
                            id: channel.id,
                            name: channel.name
                        }));

                    values[1].groups
                        .filter(group =>
                            group['is_group'] && !group['is_archived'] && !group['is_mpim'])
                        .forEach(group => slack.groups.push({
                            id: group.id,
                            name: group.name
                        }));

                    values[2].members
                        .filter(member =>
                            !member.deleted && !member['is_bot'])
                        .forEach(member => slack.users.push({
                            id: member.id,
                            name: member.name
                        }));

                    logger.debug(`Found ${slack.channels.length} channels, ${slack.groups.length} groups, and ${slack.users.length} users`);
                    return res.json(slack);
                })
                .catch(err => {
                    logger.error(err);
                    return res.status(500).end(err);
                });
        }).catch(err => {
            logger.error(err);
            return res.status(401).json(err);
        });

    } catch (err) {
        logger.error(err);
        return res.status(500).end(err);
    }
});

/**
 * @api {post} /api/slack/send Send a message as the authenticated user
 * @apiName PostMessageAsUser
 * @apiGroup Slack
 */
router.post('/send', (req, res, next) => {
    let missingParams = requireParams(['token', 'message', 'channel'], req);
    if (missingParams) {
        return res.status(400).end(missingParams);
    }

    let token = req.body.token;
    let message = req.body.message;
    let channel = req.body.channel;

    let web = new WebClient(token);

    web.auth.test().then(() => {
        web.chat.postMessage(channel, message, { 'as_user': true })
            .then(data => res.json(data))
            .catch(err => {
                logger.error(err);
                return res.status(500).json(err);
            });
    }).catch(err => {
        logger.error(err);
        return res.status(401).json(err);
    });
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
    let missingParams = requireParams(['token'], req);
    if (missingParams) {
        return res.status(400).end(missingParams);
    }

    let token = req.query.token;

    try {
        let web = new WebClient(token);

        web.auth.test().then(user => {
            web.users.info(user['user_id'])
                .then(profile => {
                    logger.debug(`Returning user info for ${profile.user.name}`);
                    return res.json({
                        id: profile.user.id,
                        name: profile.user.name,
                        realName: profile.user['real_name'],
                        imageUrl: profile.user.profile['image_original']
                    });
                })
                .catch(err => {
                    logger.error(err);
                    return res.status(500).end(err);
                });
        }).catch(err => {
            logger.error(err);
            return res.status(401).json(err);
        });

    } catch (err) {
        logger.error(err);
        return res.status(500).end(err);
    }
});

module.exports = router;
