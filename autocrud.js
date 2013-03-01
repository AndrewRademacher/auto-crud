var jsonSchema = require('json-schema');

module.exports = function (options) {

    //  Pull input and defaults
    var app = options.app,
        collection = options.collection,
        name = options.name,
        path = options.path,
        schema = options.schema;

    //  Build path structure
    var rootObjectPath = path + '/' + name;

    function echo(req, res) {
        res.statusCode = 200;
        res.json({
            params:req.params,
            body:req.body
        });
    }

    //  Build routes
    app.get(rootObjectPath, function (req, res) {
        echo(req, res);
    });

    app.get(rootObjectPath + '/:id', function (req, res) {
        echo(req, res);
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