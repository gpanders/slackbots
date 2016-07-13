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

let server;

before(() => {
    mongoose.connect(MONGO_URI);
    mongoose.model('Bot').remove({ userId: TEST_USER_ID }).exec();
});

after(() => mongoose.connection.close());

describe('/api/bots', () => {

    beforeEach(() => server = createServer());

    afterEach(done => server.close(done));

    describe('POST', () => {
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

        Object.keys(testBot).forEach(k => {
            let _body = JSON.parse(JSON.stringify(testBot)); // clone object
            delete _body[k];
            it(`returns a 400 with missing required parameter: ${k}`, done => {
                request(server)
                    .post('/api/bots')
                    .send(_body)
                    .expect(400, done);
            });
        });
    });

    describe('GET', () => {
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

        it('returns a 400 with missing required parameter: userId', done => {
            request(server)
                .get('/api/bots')
                .expect(400, done);
        });
    });

});

describe('/api/bots/:id', () => {

    beforeEach(() => server = createServer());

    afterEach(done => server.close(done));

    describe('PUT', () => {
        it('updates the bot', done => {
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
    });

    describe('GET', () => {
        it('correctly retrieves updated bot', done => {
            request(server)
                .get(`/api/bots/${testBot._id}`)
                .expect(200)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.index).to.equal(update.index);
                    expect(res.body.botname).to.equal(update.botname);
                    expect(res.body.postAsSlackbot).to.equal(update.postAsSlackbot);
                    done();
                });
        });
    });

    describe('DELETE', () => {
        it('deletes the bot', done => {
            request(server)
                .delete(`/api/bots/${testBot._id}`)
                .expect(200)
                .end(() => {
                    request(server)
                        .get(`/api/bots/${testBot._id}`)
                        .expect(404, done);
                });
        });
    });
});

describe('/api/bots/:id/send', () => {

    beforeEach(() => server = createServer());

    afterEach(done => server.close(done));

    describe('POST', () => {
        let body = { token: 'blah', channel: 'U12345', message: 'Test' };

        it('returns a 401 with an invalid token', done => {
            request(server)
                .post(`/api/bots/${testBot._id}/send`)
                .send(body)
                .expect(401, done);
        });

        Object.keys(body).forEach(k => {
            let _body = JSON.parse(JSON.stringify(body)); // clone object
            delete _body[k];
            it(`returns a 400 with missing required parameter: ${k}`, done => {
                request(server)
                    .post('/api/bots')
                    .send(_body)
                    .expect(400, done);
            });
        });
    })
})
