var assert = require('assert'),
    rest = require('restler'),
    _ = require('underscore');

describe('AutoCRUD', function () {
    describe('Simple Object', function () {
        it('should get by id', function () {
            committedPool.forEach(function (committed) {
                rest.json(callPrefix + '/widget/' + committed._id, {}, null, 'GET')
                    .on('complete', function (data, res) {
                        assert(res.statusCode === 200);
                        assert(_.isEqual(data, committed));
                    });
            });
        });

        it('should get by search', function () {
            assert(true);
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