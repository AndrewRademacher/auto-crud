var _ = require('underscore'),
	assert = require('assert'),
	getMongoProjection = require('../lib/schema-tools').getMongoProjection;

var sampleSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		username: {type:'string', required: true},
		password: {type:'string', required: true, hidden: true},
		stripe: {
			type: 'object',
			additionalProperties: false,
			properties: {
				stripeId: {type:'string', required: true},
				stripeKey: {type:'string', required: true, hidden: true}
			}
		},
		subUsers: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				properties: {
					username: {type:'string', required: true},
					password: {type:'string', required: true, hidden: true}
				}
			}
		}
	}
};

describe('Schema Manipulation', function() {
	it('should generate a mongo projection', function() {
		var projection = getMongoProjection(sampleSchema);
		assert(_.isEqual(projection, {
			'password': 0,
			'stripe.stripeKey': 0,
			'subUsers.password': 0
		}));
	});
});
