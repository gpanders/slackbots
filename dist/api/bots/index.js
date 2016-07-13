const express = require('express');
const WebClient = require('@slack/client').WebClient;

let logger = require('../../lib/helpers').getLogger();
let requireParams = require('../../lib/helpers').requireParams;

let Bot = require('../../models/Bot');
let router = express.Router();


/**
 * @apiDefine BotRequest
 *
 * @apiParam (Request Body) {String} botName Name of the bot
 * @apiParam (Request Body) {String} [imageUrl] URL of the bot's image
 * @apiParam (Request Body) {String} [type] Type of bot (group, channel, or user)
 * @apiParam (Request Body) {String} [channel] The channel id this bot will send to
 * @apiParam (Request Body) {Boolean} [postAsSlackbot=false] Whether or not to post as slackbot
 * @apiParam (Request Body) {Number} index Position of this bot in the bot list
 * @apiParam (Request Body) {String} userId The id of the user who owns this bot
 */

/**
 * @apiDefine BotResponse
 *
 * @apiSuccess {String} botName Name of the bot
 * @apiSuccess {String} imageUrl URL of the bot's image
 * @apiSuccess {String} type Type of bot (group, channel, or user)
 * @apiSuccess {String} channel The channel id this bot will send to
 * @apiSuccess {Boolean} postAsSlackbot Whether or not to post as slackbot
 * @apiSuccess {Number} index Position of this bot in the bot list
 * @apiSuccess {String} userId The id of the user who owns this bot
 */

/**
 * @api {get} /bots Retrieve all bots
 * @apiName GetBots
 * @apiGroup Bots
 *
 * @apiSuccess {Array} bots List of bots
 */
router.get('', (req, res, next) => {
    let missingParams = requireParams(['userId'], req);
    if (missingParams) {
        return res.status(400).end(missingParams);
    }

    logger.debug('Retrieving bots list');
    Bot.find({ userId: req.query.userId }).sort({ index: 1 }).exec((err, bots) => {
        if (err) {
            logger.error(`Error in GET /bots/list: ${err}`);
            return next(err);
        }

        logger.debug(`Returning ${bots.length} bots`);
        return res.json(bots);
    });
});

/**
 * @api {post} /bots Create a new bot
 * @apiName CreateBot
 * @apiGroup Bots
 *
 * @apiUse BotRequest
 * @apiUse BotResponse
 */
router.post('', (req, res, next) => {
    let missingParams = requireParams(['index', 'botname', 'userId'], req);
    if (missingParams) {
        return res.status(400).end(missingParams);
    }

    logger.debug('Creating new bot', req.body);
    Bot.create(req.body, (err, bot) => {
        if (err) {
            logger.error(`Error in POST /bots/create: ${err}`);
            return next(err);
        }

        logger.debug('Bot creation successful');
        return res.json(bot);
    });
});

/**
 * @api {get} /bots/:id Retreive a specific bot
 * @apiName GetBot
 * @apiGroup Bots
 *
 * @apiParam (Path Parameter) {String} id Unique object id of the bot to retreive
 * @apiUse BotResponse
 */
router.get('/:id', (req, res, next) => {
    logger.debug(`Retreiving bot with id=${req.params.id}`);
    Bot.findById(req.params.id, (err, bot) => {
        if (err) {
            logger.error(err);
            return next(err);
        }

        if (!bot) {
            return res.status(404).end();
        }

        return res.json(bot);
    });
});

/**
 * @api {put} /bots/:id Update a bot
 * @apiName UpdateBot
 * @apiGroup Bots
 *
 * @apiParam (Path Parameter) {String} id Unique object id of the bot to update
 * @apiUse BotRequest
 * @apiUse BotResponse
 */
router.put('/:id', (req, res, next) => {
    logger.debug(`Updating bot with id=${req.params.id}`);
    Bot.findById(req.params.id, (err, bot) => {
        if (err) {
            logger.error(`Error on PUT /bots/update/${req.params.id}: ${err}`);
            return next(err);
        }

        if (!bot) {
            return res.status(404).end();
        }

        Object.assign(bot, req.body);

        bot.save((err, bot) => {
            if (err) {
                logger.error(`Error on PUT /bots/update/${req.params.id}: ${err}`);
                return next(err);
            }

            logger.debug('Bot update successful');
            res.json(bot);
        });
    });
});

/**
 * @api {delete} /bots/:id Delete a bot
 * @apiName DeleteBot
 * @apiGroup Bots
 *
 * @apiParam (Path Parameter) {String} id Unique object id of the bot to delete
 * @apiUse BotRequest
 * @apiUse BotResponse
 */
router.delete('/:id', (req, res, next) => {
    logger.debug(`Deleting bot with id=${req.params.id}`);
    Bot.findById(req.params.id, (err, bot) => {
        if (err) {
            logger.error(`Error in DELETE /bots/delete: ${err}`);
            return next(err);
        }

        if (!bot) {
            return res.status(404).end();
        }

        bot.remove(err => {
            if (err) {
                logger.error(`Error in DELETE /bots/delete/${req.params.id}: ${err}`);
                return next(err);
            }

            logger.debug('Bot deletion successful');
            res.end();
        });
    });
});

/**
 * @api {post} /bots/:id Send a message from a bot
 * @apiName SendMessage
 * @apiGroup Bots
 *
 * @apiParam (Path Parameter) {String} id      Unique object id of the bot to post as
 * @apiParam (Request Body) {String} token     User's Slack API token
 * @apiParam (Request Body) {String} message   Message to send
 *
 * @apiSuccess {String} response Response from server
 */
router.post('/:id/send', (req, res, next) => {
    let missingParams = requireParams(['token', 'message', 'channel'], req);
    if (missingParams) {
        return res.status(400).end(missingParams);
    }

    let id = req.params.id;
    let token = req.body.token;
    let message = req.body.message;
    let channel = req.body.channel;

    let web = new WebClient(token);

    web.auth.test().then(() => {

        Bot.findById(req.params.id, (err, bot) => {
            if (!bot) {
                logger.error(`No bot with id ${id} found`);
                return res.status(404).end();
            }

            if (err) {
                logger.error(err);
                return res.status(500).json(err);
            }


            let params = {
                'username': bot.botname,
                'icon_url': bot.imageUrl
            };

            new Promise((resolve, reject) => {
                if (bot.postAsSlackbot) { resolve(channel); }
                else {
                    web.im.open(channel)
                        .then(data => resolve(data.channel.id));
                }
            }).then(channel => {
                logger.debug(`Sending message '${message}' for bot with id ${id} to channel ${channel}`);
                web.chat.postMessage(channel, message, params)
                    .then(data => res.json(data))
                    .catch(err => {
                        logger.error(err);
                        res.status(500).json(err);
                    });
            });
        });
    }).catch(err => res.status(401).json(err));
});

module.exports = router;
