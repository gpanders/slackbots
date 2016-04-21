'use strict';

var mongoose = require('mongoose');

var BotSchema = new mongoose.Schema({
    botname: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: false,
        default: ''
    },
    type: {
        type: String,
        required: false
    },
    channel: {
        type: String,
        required: false
    },
    postAsSlackbot: {
        type: Boolean,
        required: true,
        default: false
    },
    index: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Bot', BotSchema);
