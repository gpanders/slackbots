const express = require('express');
const SlackBot = require('slackbots');
const Logger = require('../../lib/logger');

const NODE_ENV = process.env.NODE_ENV || 'development';

let log = new Logger(NODE_ENV === 'production' ? 4 : (NODE_ENV === 'development' ? 1 : 2));

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
    log.debug('Retrieving bots list');
    Bot.find({ userId: req.query.userId }).sort({ index: 1 }).exec((err, bots) => {
        if (err) {
            log.error(`Error in GET /bots/list: ${err}`);
            return next(err);
        }

        log.debug(`Returning ${bots.length} bots`);
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
    log.debug('Creating new bot', req.body);
    Bot.create(req.body, (err, bot) => {
        if (err) {
            log.error(`Error in POST /bots/create: ${err}`);
            return next(err);
        }

        log.debug('Bot creation successful');
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
    log.debug(`Updating bot with id=${req.params.id}`);
    Bot.findById(req.params.id, (err, bot) => {
        if (err) {
            log.error(`Error on PUT /bots/update/${req.params.id}: ${err}`);
            return next(err);
        }

        if (!bot) {
            return res.status(404).end();
        }

        Object.assign(bot, req.body);

        bot.save((err, bot) => {
            if (err) {
                log.error(`Error on PUT /bots/update/${req.params.id}: ${err}`);
                return next(err);
            }

            log.debug('Bot update successful');
            log.info(bot);
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
    log.debug(`Deleting bot with id=${req.params.id}`);
    Bot.findById(req.params.id, (err, bot) => {
        if (err) {
            log.error(`Error in DELETE /bots/delete: ${err}`);
            return next(err);
        }

        if (!bot) {
            return res.status(404).end();
        }

        bot.remove((err, bot) => {
            if (err) {
                log.error(`Error in DELETE /bots/delete/${req.params.id}: ${err}`);
                return next(err);
            }
            
            log.debug('Bot deletion successful');
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
    let id = req.params.id;
    let token = req.body.token;
    let message = req.body.message;
    if (!token || !message) {
        if (!token) { log.error('Missing required parameter: token'); }
        if (!message) { log.error('Missing required parameter: message'); }
        return res.status(400).end();
    }

    log.debug(`Sending message '${message}' for bot with id ${id}`);

    Bot.findById(req.params.id).exec((err, bot) => {
        if (!bot) {
            log.error(`No bot with id ${id} found`);
            return res.status(404).end();
        }

        if (err) {
            log.error(err);
            return res.status(500).end();
        }

        try {
            let slackbot = new SlackBot({
                token: token,
                name: bot.botname
            });

            let params = { 'icon_url': bot.imageUrl };

            slackbot.on('start', () => {
                slackbot.postMessage(bot.channel, message, params)
                    .fail(data => res.status(500).json(data))
                    .then(data => res.json(data))
                    .always(() => slackbot.close());
            });
        } catch (e) {
            log.error(e);
            return res.status(500).end();
        }
    });
});

module.exports = router;
