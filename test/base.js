var express = require('express'),
    http = require('http'),
    path = require('path'),
    MongoClient = require('mongodb').MongoClient,
    schema = require('json-schema'),
    _ = require('underscore');

var autocrud = require('../autocrud');

var app = express(),
    server,
    mongo = {};

domain = 'localhost:3000';
callPrefix = 'http://' + domain + '/api';

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
//    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

before(function (done) {
    //  Open mongo connection
    MongoClient.connect('mongodb://localhost:27017/autocrud', function (err, conn) {
        if (err) return done(err);
        mongo.connection = conn;

        //  Prime mongo
        conn.dropDatabase(function (err) {
            if (err) return done(err);
            conn.collection('widget', function (err, widget) {
                if (err) return done(err);
                mongo.widget = widget;
                conn.collection('hoosit', function (err, hoosit) {
                    if (err) return done(err);
                    mongo.hoosit = hoosit;

                    //  Insert valid test data to mongo
                    widget.insert(validPool, function (err, result) {
                        if (err) return console.log(err);
                        result.forEach(function (resObj) {
                            resObj._id = resObj._id.toString();
                            committedPool.push(resObj);
                        });
                        committedPool = _.sortBy(committedPool, '_id');

                        //  Create autocrud route
                        autocrud({
                            app: app,
                            collection: mongo.widget,
                            name: 'widget',
                            path: '/api',
                            schema: {
                                type: 'object',
                                properties: {
                                    name: {type: 'string', required: true},
                                    dimensions: {
                                        type: 'object',
                                        properties: {
                                            width: {type: 'number', required: true},
                                            height: {type: 'number', required: true},
                                            length: {type: 'number', required: true},
                                            weight: {type: 'number', required: true}
                                        },
                                        additionalProperties: false
                                    },
                                    price: {type: 'number', required: true},
                                    description: {type: 'string'},
                                    salePrice: {type: 'number'},
                                    manufacturer: {
                                        type: 'object',
                                        properties: {
                                            name: {type: 'string'},
                                            website: {type: 'string'},
                                            phone: {type: 'string'}
                                        },
                                        additionalProperties: false
                                    }
                                },
                                additionalProperties: false
                            }
                        });

                        autocrud({
                            app: app,
                            collection: mongo.hoosit,
                            name: 'hoosit',
                            path: '/api',
                            schema: {
                                type: 'object',
                                properties: {
                                    name: {type: 'string', required: true},
                                    description: {type: 'string'},
                                    rating: {type: 'integer'},
                                    comments: {type: 'array', items: {type: 'string'}}
                                },
                                additionalProperties: false
                            },
                            postTransform: function (body) {
                                if (!body.rating) body.rating = 1;
                            }
                        });

                        //  Open test server
                        server = http.createServer(app);
                        server.listen(app.get('port'), function () {
                            console.log('Express server listening on port ' + app.get('port'));
                            done();
                        });
                    });
                });
            });
        });
    });
});

after(function () {
    server.close();
});

beforeEach(function () {

});

afterEach(function () {

});