var ObjectID = require('mongodb').ObjectID,
    jsonSchema = require('json-schema');

module.exports = function (options) {

    //  Establish required options
    var app = options.app,
        collection = options.collection,
        name = options.name,
        path = options.path,
        schema = options.schema;

    //  Optional transform options
    var postTransform = (options.postTransform) ? options.postTransform : options.defaultTransform,
        putTransform = (options.putTransform) ? options.putTransform : options.defaultTransform;

    //  Optional authentication options
    var getAuthentication = (options.getAuthentication) ? options.getAuthentication : options.defaultAuthentication,
        postAuthentication = (options.postAuthentication) ? options.postAuthentication : options.defaultAuthentication,
        putAuthentication = (options.putAuthentication) ? options.putAuthentication : options.defaultAuthentication,
        deleteAuthentication = (options.deleteAuthentication) ? options.deleteAuthentication : options.defaultAuthentication;

    //  Optional ownership options
    var ownerIdFromReq = (options.ownerIdFromReq) ? options.ownerIdFromReq : null,
        ownerField = (options.ownerField) ? options.ownerField : null;

    //  Query utility
    var createQuery = (ownerIdFromReq && ownerField) ? function (req, preOwner) {
        if (!preOwner) preOwner = {};
        preOwner[ownerField] = ownerIdFromReq(req);
        return preOwner;
    } : function (req, preOwner) {
        return (preOwner) ? preOwner : {};
    };

    //  Build path structure
    var rootObjectPath = path + '/' + name;

    //
    //  Build routes
    //

    //  GET

    var getFn = function (req, res) {
        var cursor = collection.find(createQuery(req)),
            sort = req.param('sort'),
            limit = req.param('limit'),
            skip = req.param('skip');

        if (sort) {
            if (sort.match(/^[a-zA-Z]*$/)) cursor.sort(sort);
            else cursor.sort(JSON.parse(sort));
        }
        if (limit) cursor.limit(Number(limit));
        if (limit && skip) cursor.skip(Number(skip));
        cursor.toArray(function (err, documents) {
            if (err) return res.json(500, err);
            else {
                if (limit && skip) cursor.count(function (err, count) {
                    if (err) return res.json(500, err);
                    res.json({data: documents, total: count});
                });
                else res.json({data: documents, total: documents.length});
            }
        });
    };
    if (getAuthentication) app.get(rootObjectPath, getAuthentication, getFn);
    else app.get(rootObjectPath, getFn);

    var getIdFn = function (req, res) {
        collection.findOne(createQuery(req, {_id: ObjectID(req.params.id)}), function (err, document) {
            if (err) return res.json(500, err);
            if (!document) return res.send(404);
            res.json(document);
        });
    };
    if (getAuthentication) app.get(rootObjectPath + '/:id', getAuthentication, getIdFn);
    else app.get(rootObjectPath + '/:id', getIdFn);

    //  POST

    var postFn = function (req, res) {
        var report = jsonSchema.validate(req.body, schema);
        if (!report.valid) return res.json(400, report.errors);
        if (postTransform) postTransform(req.body);
        if (ownerIdFromReq && ownerField) req.body[ownerField] = ownerIdFromReq(req);
        collection.insert(req.body, function (err, document) {
            if (err) return res.json(500, err);
            res.json(document[0]);
        });
    };
    if (postAuthentication) app.post(rootObjectPath, postAuthentication, postFn);
    else app.post(rootObjectPath, postFn);

    //  PUT

    var putIdFn = function (req, res) {
        var report = jsonSchema.validate(req.body, schema);
        if (!report.valid) return res.json(400, report.errors);
        if (putTransform) putTransform(req.body);
        collection.update(createQuery(req, {_id: ObjectID(req.params.id)}), {$set: req.body}, function (err, modCount) {
            if (err) return res.json(500, err);
            if (modCount === 0) return res.send(404);
            res.send(200);
        });
    };
    if (putAuthentication) app.put(rootObjectPath + '/:id', putAuthentication, putIdFn);
    else app.put(rootObjectPath + '/:id', putIdFn);

    //  DELETE

    var deleteIdFn = function (req, res) {
        collection.remove(createQuery(req, {_id: ObjectID(req.params.id)}), function (err, modCount) {
            if (err) return res.json(500, err);
            if (modCount === 0) return res.send(404);
            res.send(200);
        });
    };
    if (deleteAuthentication) app.delete(rootObjectPath + '/:id', deleteAuthentication, deleteIdFn);
    else app.delete(rootObjectPath + '/:id', deleteIdFn);
};