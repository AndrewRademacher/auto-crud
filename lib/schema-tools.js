var _ = require('underscore');

//
//	Projection
//

function getMongoProjection(schema, projection, parentField) {
    var props = schema.properties;
    for (var field in props) {
        var qualifiedField = (parentField) ? parentField + '.' + field : field;
        if (props[field].hidden) projection[qualifiedField] = 0;
        else if (props[field].type === 'object') getMongoProjection(props[field], projection, qualifiedField);
        else if (props[field].type === 'array' && props[field].items.type === 'object')
            getMongoProjection(props[field].items, projection, qualifiedField);
    }
}

exports.getMongoProjection = function(schema) {
    if (!schema.type || schema.type !== 'object') throw new Error('Root schema element must be of type object.');

    var projection = {};
    getMongoProjection(schema, projection, null);
    return projection;
};

//
//	Filtered Schemas
//

function getFilteredSchema(source, suffix, remove) {
    var target = {};
    for (var prop in source) {
        var m = prop.match(suffix);
        var copy = (m) ? m.index : checkRemove(prop, remove);

        if (copy) target[prop.substr(0, copy)] = handleElement(source[prop], suffix, remove);
    }
    return target;
}

function handleElement(elem, suffix, remove) {
    if (typeof elem === 'object') return getFilteredSchema(elem, suffix, remove);
    if (typeof elem === 'array') return _.each(elem, function(e) {
            return handleElement(e);
        });
    return elem;
}

function checkRemove(prop, remove) {
    for (var i = 0; i < remove.length; i++)
        if (prop.match(remove[i]))
            return 0;
    return prop.length;
}

exports.getPostSchema = function(schema) {
    if (!schema.type || schema.type !== 'object') throw new Error('Root schema element must be of type object.');
    return getFilteredSchema(schema, /_post/, [/hidden/, /_put/]);
};

exports.getPutSchema = function(schema) {
    if (!schema.type || schema.type !== 'object') throw new Error('Root schema element must be of type object.');
    return getFilteredSchema(schema, /_put/, [/hidden/, /_post/]);
};
