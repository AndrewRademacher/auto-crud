var sys = require('sys'),
    events = require('events'),
    ObjectID = require('mongodb').ObjectID,
    jsonSchema = require('json-schema'),
    schemaTools = require('./schema-tools');

function Autocrud(options) {
    if (!(this instanceof Autocrud)) return new Autocrud(options);
    events.EventEmitter.call(this);
    var $this = this;

    //  Establish required options
    var app = options.app,
        collection = options.collection,
        name = options.name,
        path = options.path,
        schema = options.schema;

    //	Generate alternate schemas and mongo projections
    var projection = schemaTools.getMongoProjection(schema);
    var postSchema = schemaTools.getPostSchema(schema),
        putSchema = schemaTools.getPutSchema(schema);

    //  Selection of which routes to create
    var getCreate = (options.getCreate) ? options.getCreate : true,
        postCreate = (options.postCreate) ? options.postCreate : true,
        putCreate = (options.putCreate) ? options.putCreate : true,
        deleteCreate = (options.deleteCreate) ? options.deleteCreate : true;

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
        ownerField = (options.ownerField) ? options.ownerField : null,
        ownerSelf = (options.ownerSelf) ? options.ownerSelf : null;

    //  Query utility
    if (ownerField && ownerSelf) throw new Error('Cannot support ownerField and ownerSelf.');
    var createQuery;
    if (ownerIdFromReq && ownerField)
        createQuery = function(req, preOwner) {
            if (!preOwner) preOwner = {};
            preOwner[ownerField] = ownerIdFromReq(req);
            return preOwner;
    };
    else if (ownerIdFromReq && ownerSelf)
        createQuery = function(req, preOwner) {
            if (!preOwner) preOwner = {};
            preOwner['_id'] = ownerIdFromReq(req);
            return preOwner;
    };
    else
        createQuery = function(req, preOwner) {
            return (preOwner) ? preOwner : {};
    };

    //  Build path structure
    var rootObjectPath = path + '/' + name;

    //
    //  Build routes
    //

    //  GET

    this.getRouteFn = function(req, res) {
        var cursor = collection.find(createQuery(req), projection),
            sort = req.param('sort'),
            limit = req.param('limit'),
            skip = req.param('skip');

        if (sort) {
            if (sort.match(/^[a-zA-Z]*$/)) cursor.sort(sort);
            else cursor.sort(JSON.parse(sort));
        }
        if (limit) cursor.limit(Number(limit));
        if (limit && skip) cursor.skip(Number(skip));
        cursor.toArray(function(err, documents) {
            if (err) return res.json(500, err);
            else {
                if (limit && skip) cursor.count(function(err, count) {
                        if (err) return res.json(500, err);
                        res.json({
                            data: documents,
                            total: count
                        });
                        $this.emit('get', documents, count);
                    });
                else {
                    res.json({
                        data: documents,
                        total: documents.length
                    });
                    $this.emit('get', documents, documents.length);
                }
            }
        });
    };
    if (getCreate) {
        if (getAuthentication) app.get(rootObjectPath, getAuthentication, this.getRouteFn);
        else app.get(rootObjectPath, this.getRouteFn);
    }

    this.getIdRouteFn = function(req, res) {
        try {
            var _id = new ObjectID(req.params.id);
            collection.findOne(createQuery(req, {
                _id: _id
            }), projection, function(err, document) {
                if (err) return res.json(500, err);
                if (!document) return res.send(404);
                res.json(document);
                $this.emit('getId', _id, document);
            });
        } catch (err) {
            res.json(400, err);
        }
    };
    if (getCreate) {
        if (getAuthentication) app.get(rootObjectPath + '/:id', getAuthentication, this.getIdRouteFn);
        else app.get(rootObjectPath + '/:id', this.getIdRouteFn);
    }

    //  POST

    this.postRouteFn = function(req, res) {
        var report = jsonSchema.validate(req.body, postSchema);
        if (!report.valid) return res.json(400, report.errors);
        if (postTransform) postTransform(req.body);
        if (ownerIdFromReq && ownerField) req.body[ownerField] = ownerIdFromReq(req);
        collection.insert(req.body, function(err, document) {
            if (err) return res.json(500, err);
            res.json({
                _id: document[0]._id
            });
            $this.emit('post', {
                _id: document[0]._id
            });
        });
    };
    if (postCreate) {
        if (postAuthentication) app.post(rootObjectPath, postAuthentication, this.postRouteFn);
        else app.post(rootObjectPath, this.postRouteFn);
    }

    //  PUT

    this.putIdRouteFn = function(req, res) {
        try {
            var _id = new ObjectID(req.params.id),
                report = jsonSchema.validate(req.body, putSchema);
            if (!report.valid) return res.json(400, report.errors);
            if (putTransform) putTransform(req.body);
            collection.update(createQuery(req, {
                _id: _id
            }), {
                $set: req.body
            }, function(err, modCount) {
                if (err) return res.json(500, err);
                if (modCount === 0) return res.send(404);
                res.send(200);
                $this.emit('putId', _id, req.body, modCount);
            });
        } catch (err) {
            res.json(400, err);
        }
    };
    if (putCreate) {
        if (putAuthentication) app.put(rootObjectPath + '/:id', putAuthentication, this.putIdRouteFn);
        else app.put(rootObjectPath + '/:id', this.putIdRouteFn);
    }

    //  DELETE

    this.deleteIdRouteFn = function(req, res) {
        try {
            var _id = new ObjectID(req.params.id);
            collection.remove(createQuery(req, {
                _id: _id
            }), function(err, modCount) {
                if (err) return res.json(500, err);
                if (modCount === 0) return res.send(404);
                res.send(200);
                $this.emit('deleteId', _id, modCount);
            });
        } catch (err) {
            res.json(400, err);
        }
    };
    if (deleteCreate) {
        if (deleteAuthentication) app.delete(rootObjectPath + '/:id', deleteAuthentication, this.deleteIdRouteFn);
        else app.delete(rootObjectPath + '/:id', this.deleteIdRouteFn);
    }
};
sys.inherits(Autocrud, events.EventEmitter);
module.exports = Autocrud;
