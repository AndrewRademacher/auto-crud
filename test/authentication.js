var assert = require('assert'),
    rest = require('restler'),
    _ = require('underscore');

describe('AutoCRUD', function () {
    describe('Security', function () {

        var adminConfig = null,
            userConfig = null;
        before(function (done) {
            rest.json(domainPrefix + '/login', {username: 'root', password: '12345'}, null, 'POST')
                .on('complete', function (data, res) {
                    adminConfig = {headers: {cookie: res.headers['set-cookie'][0]}};
                    if (res.statusCode === 200 && data.success === true) {
                        rest.json(domainPrefix + '/login', {username: 'andrew', password: '12345'}, null, 'POST')
                            .on('complete', function (data, res) {
                                userConfig = {headers: {cookie: res.headers['set-cookie'][0]}};
                                if (res.statusCode === 200 && data.success === true) done();
                                else throw data.err;
                            });
                    }
                    else throw data.err;
                });
        });

        describe('Ownership', function () {
            it('should get only when object owner', function (done) {
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
            it('should get when user has admin role', function (done) {
                rest.json(callPrefix + '/user', {}, adminConfig, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        assert(data.total > 0);
                        assert(data.data.length === data.total);
                        done();
                    });
            });

            it('should not get when user does not have admin role', function (done) {
                rest.json(callPrefix + '/user', {}, userConfig, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 401);
                        assert(data === 'Unauthenticated');
                        done();
                    });
            });
        });
    });
});