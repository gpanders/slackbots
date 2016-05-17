const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const assets = require('./webpack.assets');

let logger = require('./lib/helpers').getLogger();

let Bot = require('./models/Bot');

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 9000;

mongoose.connect(MONGO_URI, () => {
    logger.debug(`Mongoose connected to Mongo at ${MONGO_URI}`);
});

let app = express();

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

app.use('/api/bots', require('./api/bots'));
app.use('/api/slack', require('./api/slack'));

app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));

module.exports = app;
