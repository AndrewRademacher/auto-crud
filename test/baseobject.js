var assert = require('assert'),
    rest = require('restler');

describe('AutoCRUD', function () {
    describe('Simple Object', function () {
        it('should get by id', function () {
            rest.json('http://' + domain + '/api/widget', {}, null, 'GET')
                .on('complete', function (data, res) {
                    console.log(data);
                    console.log(res.statusCode);
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