'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const assets = require('./webpack.assets');

let Bot = require('./models/Bot');

class Logger {
    /*
        4 = ERROR
        3 = WARN
        2 = INFO
        1 = DEBUG
    */
    constructor(level) {
        this._level = level ? level : 3;
    }

    setLevel(level) {
        this._level = level;
    }

    error(msg) {
        if (this._level <= 4) {
            console.error(`[ERROR] ${msg}`);
        }
    }

    warn(msg) {
        if (this._level <= 3) {
            console.log(`[WARN] ${msg}`);
        }
    }

    info(msg) {
        if (this._level <= 2) {
            console.log(`[INFO] ${msg}`);
        }
    }

    debug(msg) {
        if (this._level <= 1) {
            console.log(`[DEBUG] ${msg}`);
        }
    }
}

const MONGO_URI = process.env.MONGO_URI;
const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 9000;

const LOG = new Logger();

LOG.setLevel(NODE_ENV === 'production' ? 4 : (NODE_ENV === 'dev' ? 1 : 2));

mongoose.connect(MONGO_URI, () => {
    LOG.debug(`Mongoose connected to Mongo at ${MONGO_URI}`);
});

let app = express();
let router = express.Router();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.get('/', (req, res) => {
    res.render('index.html.ejs', {
        vendor: {
            js: assets.vendor.js
        },
        app: {
            js: assets.app.js
        }
    });
});

router.get('/list', (req, res, next) => {
    LOG.debug('Retrieving bots list');
    Bot.find({ userId: req.query.userId }).sort({ index: 1 }).exec((err, bots) => {
        if (err) {
            LOG.error(`Error in GET /bots/list: ${err}`);
            return next(err);
        }

        LOG.debug(`Returning ${bots.length} bots`);
        res.json(bots);
    });
});

router.post('/create', (req, res, next) => {
    LOG.debug('Creating new bot', req.body);
    Bot.create(req.body, (err, bot) => {
        if (err) {
            LOG.error(`Error in POST /bots/create: ${err}`);
            return next(err);
        }

        LOG.debug('Bot creation successful');
        res.json(bot);
    });
});

router.put('/update', (req, res, next) => {
    LOG.debug(`Updating bot with id=${req.query.id}`);
    let bot = new Bot(req.body);
    Bot.findByIdAndUpdate(req.query.id,
        {
            botname: bot.botname,
            imageUrl: bot.imageUrl,
            type: bot.type,
            channel: bot.channel,
            postAsSlackbot: bot.postAsSlackbot,
            index: bot.index,
            userId: bot.userId
        },
        (err, bot) => {
            if (err) {
                LOG.error(`Error on PUT /bots/update/${req.query.id}: ${err}`);
                return next(err);
            }

            LOG.debug('Bot update successful');
            res.json(bot);
        }
    );
});

router.delete('/delete', (req, res, next) => {
    LOG.debug(`Deleting bot with id=${req.query.id}`);
    Bot.findById(req.query.id).remove((err, bot) => {
        if (err) {
            LOG.error(`Error in DELETE /bots.delete: ${err}`);
            return next(err);
        }

        LOG.debug('Bot deletion successful');
        res.json(bot);
    });
});

app.use('/bots', router);

app.listen(PORT, () => {
    LOG.info(`Listening on port ${PORT}`);
});

module.exports = app;
