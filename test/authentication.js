var assert = require('assert'),
    rest = require('restler'),
    _ = require('underscore');

describe('AutoCRUD', function () {
    describe('Security', function () {

        var cookie = null;
        before(function (done) {
            rest.json(domainPrefix + '/login', {
                username: 'andrew',
                password: '12345'
            }, null, 'POST')
                .on('complete', function (data, res) {
                    cookie = res.headers['set-cookie'][0];
                    if (res.statusCode === 200 && data.success === true) done();
                    else throw data.err;
                });
        });

        describe('Ownership', function () {
            it('should get only when object owner', function (done) {
                assert(cookie);
                console.log(cookie);
                done();
            });

            it('should put only when object owner', function (done) {
                done();
            });

            it('should delete only when object owner', function (done) {
                done();
            });
        });

        describe('Authentication', function () {
            it('should connect to an authentication device', function (done) {
                done();
            });
        });

        describe('Method Permission', function () {
            it('should only get when role allows', function (done) {
                done();
            });

            it('should only post when role allows', function (done) {
                done();
            });

            it('should only put when role allows', function (done) {
                done();
            });

            it('should only delete when role allows', function (done) {
                done();
            });
        });
    });
});