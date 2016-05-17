const request = require('supertest');
let expect = require('chai').expect;
const express = require('express');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;

const TEST_USER_ID = 'TEST12345';

const Slack = require('../../dist/api/slack');

function createServer() {
    let app = express();
    app.use(bodyParser.json());
    app.use('/api/slack', Slack);
    return app.listen(PORT);
}

let server;

describe('/api/slack', () => {
    beforeEach(() => server = createServer());

    afterEach(done => server.close(done));

    describe('GET', () => {
        it('returns a 401 with an invalid token', done => {
            request(server)
                .get('/api/slack?token=fake_token')
                .expect(401, done);
        });

        it('returns a 400 with a missing token', done => {
            request(server)
                .get('/api/slack')
                .expect(400, done);
        });
    });

});

describe('/api/slack/send', () => {

    describe('POST', () => {
        let body = {token: 'fake_token', message: 'Test', channel: 'U10234' };
        it('returns a 401 with an invalid token', done => {
            request(server)
                .post('/api/slack/send')
                .send(body)
                .expect(401, done);
        });

        Object.keys(body).forEach(k => {
            let _body = JSON.parse(JSON.stringify(body));
            delete _body[k];
            it(`returns a 400 with missing parameter: ${k}`, done => {
                request(server)
                    .post('/api/slack/send')
                    .send(_body)
                    .expect(400, done);
            });
        });

    });

});

describe('/api/slack/user', () => {
    describe('GET', () => {
        it('returns a 401 with an invalid token', done => {
            request(server)
                .get('/api/slack/user?token=fake_token')
                .expect(401, done);
        });

        it('returns a 400 with a missing token', done => {
            request(server)
                .get('/api/slack')
                .expect(400, done);
        });
    });
});
