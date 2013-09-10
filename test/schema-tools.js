var _ = require('underscore'),
    assert = require('assert'),
    getMongoProjection = require('../lib/schema-tools').getMongoProjection,
    getPostSchema = require('../lib/schema-tools').getPostSchema,
    getPutSchema = require('../lib/schema-tools').getPutSchema;

var sampleSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        username: {
            type: 'string',
            required: true
        },
        password: {
            type: 'string',
            required_post: true,
            hidden: true,
        },
        stripe: {
            type: 'object',
            additionalProperties: false,
            properties: {
                stripeId: {
                    type: 'string',
                    required: true
                },
                stripeKey: {
                    type: 'string',
                    required_post: true,
                    hidden: true
                }
            }
        },
        updateTime: {
            type: 'string',
            required_put: true
        },
        subUsers: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    username: {
                        type: 'string',
                        required: true
                    },
                    password: {
                        type: 'string',
                        required_post: true,
                        hidden: true
                    }
                }
            }
        }
    }
};

describe('Schema Manipulation (Library)', function() {
    it('should generate a mongo projection', function() {
        var projection = getMongoProjection(sampleSchema);
        assert(_.isEqual(projection, {
            'password': 0,
            'stripe.stripeKey': 0,
            'subUsers.password': 0
        }));
    });

    function removeHiddenTags(schema) {
        delete schema.properties.password.hidden;
        delete schema.properties.stripe.properties.stripeKey.hidden;
        delete schema.properties.subUsers.items.properties.password.hidden;
    }

    function removeRequiredByTags(schema) {
        delete schema.properties.password.required_post;
        delete schema.properties.stripe.properties.stripeKey.required_post;
        delete schema.properties.subUsers.items.properties.password.required_post;

        delete schema.properties.updateTime.required_put;
    }

    var sampleSchemaCache = JSON.stringify(sampleSchema);

    describe('Post Schema (Variant)', function() {
        it('should replace requirePost tags with the require tag and remove requirePut tags', function() {
            var variant = JSON.parse(JSON.stringify(sampleSchema));

            removeHiddenTags(variant);
            removeRequiredByTags(variant);

            variant.properties.password.required = true;
            variant.properties.stripe.properties.stripeKey.required = true;
            variant.properties.subUsers.items.properties.password.required = true;

            assert(_.isEqual(variant, getPostSchema(sampleSchema)));
        });

        it('should not allow varient schemas to alter original', function() {
            assert(_.isEqual(JSON.parse(sampleSchemaCache), sampleSchema));
        });
    });

    describe('Put Schema (Variant)', function() {
        it('should replace requirePut tags with the require tag, and remove requirePost tags', function() {
            var variant = JSON.parse(JSON.stringify(sampleSchema));

            removeHiddenTags(variant);
            removeRequiredByTags(variant);

            variant.properties.updateTime.required = true;
            assert(_.isEqual(variant, getPutSchema(sampleSchema)));
        });

        it('should not allow varient schemas to alter original', function() {
            assert(_.isEqual(JSON.parse(sampleSchemaCache), sampleSchema));
        });
    });
});
