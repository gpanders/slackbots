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

describe('Slack API', () => {
    let server;

    beforeEach(() => server = createServer());

    afterEach(done => server.close(done));

    it('returns a 500 with an invalid token', done => {
        request(server)
            .get('/api/slack?token=fake_token')
            .expect(500, done);
    });
});
