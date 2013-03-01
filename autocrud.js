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
            id:req.params.id,
            params:req.params,
            body:req.body
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
        echo(req, res);
    });

    app.get(rootObjectPath + '/:id', function (req, res) {
        collection.findOne({_id:ObjectID(req.params.id)}, function (err, document) {
            if (err) return respondError(res, err, 500);
            respondSuccess(res, document);
        });
    });

    app.post(rootObjectPath, function (req, res) {
        echo(req, res);
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