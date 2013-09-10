function getMongoProjection(schema, projection, parentField) {
    if (!schema.type || schema.type !== 'object') throw new Error('Root schema element must be of the type object.');

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
    var projection = {};
    getMongoProjection(schema, projection, null);
    return projection;
};
