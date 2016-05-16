const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Logger = require('./lib/logger');

const assets = require('./webpack.assets');

let Bot = require('./models/Bot');

const MONGO_URI = process.env.MONGO_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 9000;

let log = new Logger(NODE_ENV === 'production' ? 4 : (NODE_ENV === 'development' ? 1 : 2));

mongoose.connect(MONGO_URI, () => {
    log.debug(`Mongoose connected to Mongo at ${MONGO_URI}`);
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

app.listen(PORT, () => {
    log.info(`Listening on port ${PORT}`);
});

module.exports = app;
