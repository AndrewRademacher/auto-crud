var assert = require('assert'),
    rest = require('restler'),
    _ = require('underscore');

describe('Schema Manipulation (Implementation)', function() {
    it('should not return hidden fields in GET calls', function(done) {
        rest.json(callPrefix + '/schema', {
            username: 'testuser',
            password: 'pass'
        }, null, 'POST')
            .on('complete', function(data, res) {
            assert(res.statusCode === 200);

            rest.json(callPrefix + '/schema/' + data._id, null, null, 'GET')
                .on('complete', function(data, res) {
                assert(data.username);
                assert(!data.password);
                done();
            });
        });
    });
});
