var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

mongoose.connect(process.env.MONGOLAB_URI);

var Bot = require('./models/Bot');

var app = express();
var router = express.Router();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.listen(9000, '0.0.0.0', function() {
    console.log('Listening to port 9000');
});

router.get('/bots/list', function(req, res, next) {
    Bot.find({ userId: req.query.userId }).sort({ index: 1 }).exec(function(err, bots) {
        if (err) {
            console.error('Error in GET /bots/list:' + err);
            return next(err);
        }

        res.json(bots);
    });
});

router.post('/bots/create', function(req, res, next) {
    Bot.create(req.body, function(err, bot) {
        if (err) {
            console.error('Error in POST /bots/create:' + err);
            return next(err);
        }

        res.json(bot);
    });
});

router.put('/bots/update', function(req, res, next) {
    var bot = new Bot(req.body);
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
        function(err, bot) {
            if (err) {
                console.error('Error on PUT /bots/update/' + req.query.id + ': ' + err);
                return next(err);
            }

            res.json(bot);
        }
    );
});

router.delete('/bots/delete', function(req, res, next) {
    Bot.findById(req.query.id).remove(function(err, bot) {
        if (err) {
            console.error('Error in DELETE /bots.delete:' + err);
            return next(err);
        }

        res.json(bot);
    });
});

app.use('/', router);

module.exports = app;
