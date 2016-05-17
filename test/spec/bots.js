const request = require('supertest');
let expect = require('chai').expect;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const TEST_USER_ID = 'TEST12345';

const Bots = require('../../dist/api/bots');

function createServer() {
    let app = express();
    app.use(bodyParser.json());
    app.use('/api/bots', Bots);
    return app.listen(PORT);
}

// Original data to POST
let testBot = {
    userId: TEST_USER_ID,
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

    before(() => {
        mongoose.connect(MONGO_URI);
        mongoose.model('Bot').find({ userId: TEST_USER_ID }).remove();
    });

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
            .get(`/api/bots?userId=${TEST_USER_ID}`)
            .expect(200)
            .end((err, res) => {
                if (err) { return done(err); }
                expect(res.body).to.have.lengthOf(1);
                expect(res.body[0]).to.deep.equal(testBot);
                done();
            });
    });

    it('can update the bot', done => {
        request(server)
            .put(`/api/bots/${testBot._id}`)
            .send(update)
            .expect(200)
            .end((err, res) => {
                if (err) { return done(err); }
                expect(res.body.index).to.equal(update.index);
                expect(res.body.botname).to.equal(update.botname);
                expect(res.body.postAsSlackbot).to.equal(update.postAsSlackbot);
                done();
            });
    });

    it('correctly retrieves updated bot', done => {
        request(server)
            .get(`/api/bots?userId=${TEST_USER_ID}`)
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
