const request = require('supertest');
const expect = require('chai').expect;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Logger = require('../../lib/logger');

const log = new Logger();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const userId = 'TEST12345';

function createServer() {
    let app = express();
    app.use(bodyParser.json());
    app.use('/api/bots', require('../../api/bots'));
    return app.listen(PORT, () => log.info(`Test server started and running on port ${PORT}`));
}

// Original data to POST
let testBot = {
    userId: userId,
    botname: 'Test Bot',
    index: 0
};

// Request body to update with PUT
const update = {
    index: 1,
    botname: 'Updated Test Bot',
    postAsSlackbot: false
};


describe('Bots API', () => {
    let server;

    before(() => mongoose.connect(MONGO_URI));

    beforeEach(() => server = createServer());

    afterEach(done => server.close(done));

    it('creates a new bot', done => {
        request(server)
            .post('/api/bots')
            .send(testBot)
            .expect(200)
            .end((err, res) => {
                if (err) { return done(err); }
                expect(res.body._id).to.be.defined;
                expect(res.body.userId).to.equal(testBot.userId);
                expect(res.body.botname).to.equal(testBot.botname);
                expect(res.body.index).to.equal(testBot.index);

                testBot = res.body;

                done();
            });
    });

    it('retrieves newly created bot', done => {
        request(server)
            .get(`/api/bots?userId=${userId}`)
            .expect(200)
            .end((err, res) => {
                if (err) { return done(err); }
                expect(res.body).to.have.lengthOf(1);
                expect(res.body[0]).to.deep.equal(testBot);
                done();
            });
    });

    it('can update the bot', done => {
        log.info('testBot._id = ' + testBot._id);
        request(server)
            .put(`/api/bots/${testBot._id}`)
            .send(update)
            .expect(200)
            .end((err, res) => {
                if (err) { return done(err); }
                log.info(res.body);
                expect(res.body.index).to.equal(update.index);
                expect(res.body.botname).to.equal(update.botname);
                expect(res.body.postAsSlackbot).to.equal(update.postAsSlackbot);
                done();
            });
    });

    it('correctly retrieves updated bot', done => {
        request(server)
            .get(`/api/bots?userId=${userId}`)
            .expect(200)
            .end((err, res) => {
                if (err) { return done(err); }
                expect(res.body).to.have.lengthOf(1);
                expect(res.body[0].index).to.equal(update.index);
                expect(res.body[0].botname).to.equal(update.botname);
                expect(res.body[0].postAsSlackbot).to.equal(update.postAsSlackbot);
                done();
            });
    });

    it('deletes the bot', done => {
        request(server)
            .delete(`/api/bots/${testBot._id}`)
            .expect(200, done);
    });
});
