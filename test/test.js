'use strict'

const Code = require('code');
const Lab = require('lab');

const expect = Code.expect;
const lab =exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;
const after = lab.after;


//require hapi server
const Server = require('../server');


//tests
describe('Test', () => {
    it('should get issues like array', async () => {
        //make API cal to self to test functionality end-to-end
        const response = await Server.inject({
            method: 'GET',
            url: '/issues'
        });

        expect(response.result).to.be.a.array()

    });

    it('should return object for issueid', async () => {
        const response = await Server.inject({
            method: 'GET',
            url: '/issues/605d5e70f817472a807a3b13'
        });

        expect(response.statusCode).to.equal(200);
    });

    it('should return object', async () => {
        const response = await Server.inject({
            method: 'POST',
            url: 'issues'
        });

        expect(response.result).to.be.a.object();
    });

    it('should return error 400 wrong input ', async () => {
        const response = await Server.inject({
            method: 'POST',
            url: '/issues',
            payload: {
                title: 'Title',
                description: 'Some desc',
                state: 'wrong'
            }
        });

        expect(response.statusCode).to.equal(400);
    });

    it('should return all comments ', async () => {
        const response = await Server.inject({
            method: 'GET',
            url: '/comments',

        });

        expect(response.statusCode).to.equal(200);
    });

    it('should return error for invalid path', async () => {
        const response = await Server.inject({
            method: 'GET',
            url: '/invalidPath',
        });

        expect(response.statusCode).to.equal(404);
    });

    it('should return error. This id is deleted on first attempt', async () => {
        const response = await Server.inject({
            method: 'DELETE',
            url: '/issues/605d5e73f817472a807a3b14',
        });

        expect(response.statusCode).to.equal(200);
    });

})
