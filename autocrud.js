var ObjectID = require('mongodb').ObjectID,
    jsonSchema = require('json-schema');

module.exports = function (options) {

    //  Utility functions
    var respondError = function (res, err, code) {
        res.statusCode = code;
        res.json(err);
    }

    var respondSuccess = function (res, result) {
        res.statusCode = 200;
        res.json(result);
    }

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

    //  Build path structure
    var rootObjectPath = path + '/' + name;

    //
    //  Build routes
    //

    //  GET

    var getFn = function (req, res) {
        var cursor = collection.find(),
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
            if (err) return respondError(res, err, 500);
            else {
                if (limit && skip) cursor.count(function (err, count) {
                    if (err) return respondError(res, err, 500);
                    else respondSuccess(res, {data: documents, total: count});
                });
                else respondSuccess(res, {data: documents, total: documents.length});
            }
        });
    };
    if (getAuthentication) app.get(rootObjectPath, getAuthentication, getFn);
    else app.get(rootObjectPath, getFn);

    var getIdFn = function (req, res) {
        collection.findOne({_id: ObjectID(req.params.id)}, function (err, document) {
            if (err) return respondError(res, err, 500);
            respondSuccess(res, document);
        });
    };
    if (getAuthentication) app.get(rootObjectPath + '/:id', getAuthentication, getIdFn);
    else app.get(rootObjectPath + '/:id', getIdFn);

    //  POST

    var postFn = function (req, res) {
        var report = jsonSchema.validate(req.body, schema);
        if (!report.valid) return respondError(res, report.errors, 400);
        if (postTransform) postTransform(req.body);
        collection.insert(req.body, function (err, document) {
            if (err) return respondError(res, err, 500);
            respondSuccess(res, document[0]);
        });
    };
    if (postAuthentication) app.post(rootObjectPath, postAuthentication, postFn);
    else app.post(rootObjectPath, postFn);

    //  PUT

    var putIdFn = function (req, res) {
        var report = jsonSchema.validate(req.body, schema);
        if (!report.valid) return  respondError(res, report.errors, 400);
        if (putTransform) putTransform(req.body);
        collection.update({_id: ObjectID(req.params.id)}, {$set: req.body}, function (err) {
            if (err) return respondError(res, err, 500);
            respondSuccess(res);
        });
    };
    if (putAuthentication) app.put(rootObjectPath + '/:id', putAuthentication, putIdFn);
    else app.put(rootObjectPath + '/:id', putIdFn);

    //  DELETE

    var deleteIdFn = function (req, res) {
        collection.remove({_id: ObjectID(req.params.id)}, function (err) {
            if (err) return respondError(res, err, 500);
            respondSuccess(res);
        });
    };
    if (deleteAuthentication) app.delete(rootObjectPath + '/:id', deleteAuthentication, deleteIdFn);
    else app.delete(rootObjectPath + '/:id', deleteIdFn);
};