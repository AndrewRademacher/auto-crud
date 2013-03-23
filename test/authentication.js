var assert = require('assert'),
    rest = require('restler'),
    _ = require('underscore');

describe('AutoCRUD', function () {
    describe('Security', function () {

        var adminCookie = null,
            userCookie = null;
        before(function (done) {
            rest.json(domainPrefix + '/login', {username: 'root', password: '12345'}, null, 'POST')
                .on('complete', function (data, res) {
                    adminCookie = res.headers['set-cookie'][0];
                    if (res.statusCode === 200 && data.success === true) {
                        rest.json(domainPrefix + '/login', {username: 'andrew', password: '12345'}, null, 'POST')
                            .on('complete', function (data, res) {
                                userCookie = res.headers['set-cookie'][0];
                                if (res.statusCode === 200 && data.success === true) done();
                                else throw data.err;
                            });
                    }
                    else throw data.err;
                });
        });

        describe('Ownership', function () {
            it('should get only when object owner', function (done) {
                assert(adminCookie);
                assert(userCookie);
                console.log(adminCookie);
                console.log(userCookie);
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