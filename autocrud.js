var ObjectID = require('mongodb').ObjectID,
    jsonSchema = require('json-schema');

module.exports = function (options) {

    //  Pull input and defaults
    var app = options.app,
        collection = options.collection,
        name = options.name,
        path = options.path,
        schema = options.schema;

    //  Build path structure
    var rootObjectPath = path + '/' + name;

    //  Drop this function before production
    function echo(req, res) {
        res.statusCode = 200;
        res.json({
            id: req.params.id,
            params: req.params,
            body: req.body
        });
    }

    function respondError(res, err, code) {
        res.statusCode = code;
        res.json(err);
    }

    function respondSuccess(res, result) {
        res.statusCode = 200;
        res.json(result);
    }

    //  Build routes
    app.get(rootObjectPath, function (req, res) {
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
    });

    app.get(rootObjectPath + '/:id', function (req, res) {
        collection.findOne({_id: ObjectID(req.params.id)}, function (err, document) {
            if (err) return respondError(res, err, 500);
            respondSuccess(res, document);
        });
    });

    app.post(rootObjectPath, function (req, res) {
        var report = jsonSchema.validate(req.body, schema);
        if (!report.valid) respondError(res, report.errors, 400);
        collection.insert(req.body, function (err, document) {
            if (err) return respondError(res, err, 500);
            respondSuccess(res, document[0]);
        });
    });

    app.put(rootObjectPath + '/:id', function (req, res) {
        echo(req, res);
    });

    app.put(rootObjectPath, function (req, res) {
        echo(req, res);
    });

    app.delete(rootObjectPath + '/:id', function (req, res) {
        echo(req, res);
    });

    app.delete(rootObjectPath, function (req, res) {
        echo(req, res);
    });
};