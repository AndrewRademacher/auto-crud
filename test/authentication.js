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
            var adminEntryId = null;
            it('should attach an owner on post (admin)', function (done) {
                rest.json(callPrefix + '/blog', {
                    title: 'Admin Entry',
                    entry: 'This is a blog post!'
                }, adminConfig, 'POST')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        assert(data._id);
                        adminEntryId = data._id;
                        done();
                    });
            });

            var userEntryId = null;
            it('should attach an owner on post (user)', function (done) {
                rest.json(callPrefix + '/blog', {
                    title: 'Entry #1',
                    entry: 'This is a blog post!'
                }, userConfig, 'POST')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        assert(data._id);
                        userEntryId = data._id;
                        done();
                    });
            });

            it('should get only when object owner (list)', function (done) {
                rest.json(callPrefix + '/blog', {}, userConfig, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode);
                        assert(data.data.length === 1);
                        assert(data.data[0]._id);
                        done();
                    });
            });

            it('should get only when object owner (single)', function (done) {
                rest.json(callPrefix + '/blog/' + userEntryId, {}, userConfig, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        assert(data._id);
                        assert(data.owner);
                        done();
                    });
            });

            it('should not get when object is not owned (single)', function (done) {
                rest.json(callPrefix + '/blog/' + adminEntryId, {}, userConfig, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 404);
                        done();
                    });
            });

            it('should put only when object owner', function (done) {
                rest.json(callPrefix + '/blog/' + userEntryId, {
                    title: 'Entry #1',
                    entry: 'This is a modified blog post!'
                }, userConfig, 'PUT')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        done();
                    });
            });

            it('should not put when object is not owned (single)', function (done) {
                rest.json(callPrefix + '/blog/' + adminEntryId, {
                    title: 'Admin Entry',
                    entry: 'This is a modified admin blog post!'
                }, userConfig, 'PUT')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 404);
                        done();
                    });
            });

            it('should delete only when object owner', function (done) {
                rest.json(callPrefix + '/blog/' + userEntryId, {}, userConfig, 'DELETE')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        done();
                    });
            });

            it('should not delete when object is not owned', function (done) {
                rest.json(callPrefix + '/blog/' + adminEntryId, {}, userConfig, 'DELETE')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 404);
                        done();
                    });
            });
        });

		describe('Self Ownership', function() {
			it('should post without prior authentication', function(done) {
				rest.json(callPrefix + '/owned', {
					username: 'testuser',
					password: 'password'
				}, null, 'POST')
					.on('complete', function(data, res) {
						assert(res.statusCode === 200);
						assert(data._id);
						done();
					});
			});

			var userConfig = null;
			it('should login as owned user', function(done) {
				rest.json(domainPrefix + '/login/owned', {username: 'testuser', password: 'password'},
					null, 'POST')
					.on('complete', function(data, res) {
						userConfig = {headers: {cookie: res.headers['set-cookie'][0]}};
						assert(data.success === true);
						assert(res.statusCode === 200);
						done();
					});
			});

			it('should allow a user to view self', function(done) {
				rest.json(callPrefix + '/owned', {}, userConfig, 'GET')
					.on('complete', function(data, res) {
						assert(data.total === 1);
						assert(data.data[0].username === 'testuser');
						assert(data.data[0].password === 'password');
						done();
					});
			});

			it('should allow user to edit self', function(done) {
				rest.json(callPrefix + '/owned', {}, userConfig, 'GET')
					.on('complete', function(data, res) {
						assert(res.statusCode === 200);
						rest.json(callPrefix + '/owned/' + data.data[0]._id, {
							username: data.data[0].username,
							password: data.data[0].password,
							email: 'testuser@company.com'
						}, userConfig, 'PUT')
							.on('complete', function(data, res) {
								assert(res.statusCode === 200);
								done();
							});
					});
			});

			it('should allow user to delete self', function(done) {
				rest.json(callPrefix + '/owned', {}, userConfig, 'GET')
					.on('complete', function(data, res) {
						assert(res.statusCode === 200);
						rest.json(callPrefix + '/owned/' + data.data[0]._id, {}, userConfig, 'DELETE')
							.on('complete', function(data, res) {
								assert(res.statusCode === 200);
								done();
							});
					});
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
