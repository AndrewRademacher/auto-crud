var assert = require('assert'),
    rest = require('restler'),
    _ = require('underscore');

describe('AutoCRUD', function () {
    describe('Simple Object', function () {
        it('should get by id', function (done) {
            var committedCount = committedPool.length;
            committedPool.forEach(function (committed) {
                rest.json(callPrefix + '/widget/' + committed._id, {}, null, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        assert(_.isEqual(data, committed));
                        if (--committedCount === 0) done();
                    });
            });
        });

        it('should get all', function (done) {
            rest.json(callPrefix + '/widget', {}, null, 'GET')
                .on('complete', function (data, res) {
                    assert(res.statusCode === 200);
                    data.data = _.sortBy(data.data, '_id');
                    for (var i = 0; i < data.data.length; i++)
                        assert(_.isEqual(data.data[i], committedPool[i]));
                    done();
                });
        });

        describe('Limited Get', function () {
            it('should only get one', function (done) {
                rest.json(callPrefix + '/widget?limit=1', {}, null, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        assert(data.data.length === 1);
                        assert(_.isEqual(data.data[0], committedPool[0]));
                        done();
                    });
            });

            it('should give count if limit and skip', function (done) {
                rest.json(callPrefix + '/widget?limit=1&skip=0', {}, null, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        assert(data.data.length === 1);
                        assert(_.isEqual(data.data[0], committedPool[0]));
                        assert(data.total > 1);
                        done();
                    });
            });

            it('should get the second element', function (done) {
                rest.json(callPrefix + '/widget?limit=1&skip=1', {}, null, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        assert(data.data.length === 1);
                        assert(_.isEqual(data.data[0], committedPool[1]));
                        assert(data.total > 1);
                        done();
                    });
            });
        });

        describe('Sorted Get', function () {
            it('should allow format {"price":"asc"}', function (done) {
                rest.json(callPrefix + '/widget?sort={"price":"asc"}', {}, null, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        var sortedCommited = _.sortBy(committedPool, 'price');
                        for (var i = 0; i < data.data.length; i++)
                            assert(data.data[i]._id === sortedCommited[i]._id);
                        done();
                    });
            });

            it('should allow format {"price":-1}', function (done) {
                rest.json(callPrefix + '/widget?sort={"price":-1}', {}, null, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        var sortedCommited = _.sortBy(committedPool, 'price').reverse();
                        for (var i = 0; i < data.data.length; i++)
                            assert(data.data[i]._id === sortedCommited[i]._id);
                        done();
                    });
            });

            it('should allow format [["price", "asc"]]', function (done) {
                rest.json(callPrefix + '/widget?sort=[["price", "asc"]]', {}, null, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        var sortedCommited = _.sortBy(committedPool, 'price');
                        for (var i = 0; i < data.data.length; i++)
                            assert(data.data[i]._id === sortedCommited[i]._id);
                        done();
                    });
            });

            it('should allow format "price"', function (done) {
                rest.json(callPrefix + '/widget?sort="price"', {}, null, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        var sortedCommited = _.sortBy(committedPool, 'price');
                        for (var i = 0; i < data.data.length; i++)
                            assert(data.data[i]._id === sortedCommited[i]._id);
                        done();
                    });
            });

            it('should allow format price', function (done) {
                rest.json(callPrefix + '/widget?sort=price', {}, null, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        var sortedCommited = _.sortBy(committedPool, 'price');
                        for (var i = 0; i < data.data.length; i++)
                            assert(data.data[i]._id === sortedCommited[i]._id);
                        done();
                    });
            });
        });

        it('should post', function () {
            assert(true);
        });

        it('should put by id', function () {
            assert(true);
        });

        it('should put by search', function () {
            assert(true);
        });

        it('should delete by id', function () {
            assert(true);
        });

        it('should delete by search', function () {
            assert(true);
        });
    });
});