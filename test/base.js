var express = require('express'),
    http = require('http'),
    path = require('path'),
    MongoClient = require('mongodb').MongoClient,
    schema = require('json-schema'),
    _ = require('underscore'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var autocrud = require('../autocrud');

var app = express(),
    server,
    mongo = {};

domain = 'localhost:3000';
domainPrefix = 'http://' + domain;
callPrefix = 'http://' + domain + '/api';

passport.use(new LocalStrategy(function (username, password, done) {
    mongo.user.findOne({username: username, password: password}, function (err, user) {
        if (err)done(err);
        else done(null, user);
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
//    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

function defineAPI(done) {
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

    autocrud({
        app: app,
        collection: mongo.user,
        name: 'user',
        path: '/api',
        schema: {
            type: 'object',
            properties: {
                username: {type: 'string', required: true},
                password: {type: 'string', required: true},
                roles: {type: 'array', items: {type: 'string'}}
            },
            additionalProperties: false
        },
        defaultAuthentication: function (req, res, next) {
            if (req.isAuthenticated() && _.contains(req.user.roles, 'administrator')) next();
            else res.send(401, 'Unauthenticated');
        }
    });

    autocrud({
        app: app,
        collection: mongo.blog,
        name: 'blog',
        path: '/api',
        schema: {
            type: 'object',
            properties: {
                title: {type: 'string', required: true},
                entry: {type: 'string', required: true},
                comments: {type: 'array', items: {type: 'string'}}
            },
            additionalProperties: false
        }
    });

    app.post('/login', passport.authenticate('local'), function (req, res) {
        res.json(200, {success: true});
    });

    //  Open test server
    server = http.createServer(app);
    server.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
        done();
    });
}

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
                    conn.collection('user', function (err, user) {
                        if (err) return done(err);
                        mongo.user = user;
                        conn.collection('blog', function (err, blog) {
                            if (err) return done(err);
                            mongo.blog = blog;

                            //  Insert valid test data to mongo
                            widget.insert(validPool, function (err, result) {
                                if (err) return console.log(err);
                                result.forEach(function (resObj) {
                                    resObj._id = resObj._id.toString();
                                    committedPool.push(resObj);
                                });
                                committedPool = _.sortBy(committedPool, '_id');

                                defineAPI(done);
                            });

                            // Insert valid users to mongo
                            user.insert({
                                username: 'andrew',
                                password: '12345',
                                roles: ['customer']
                            }, function (err, result) {
                                if (err) return console.log(err);
                            });

                            user.insert({
                                username: 'root',
                                password: '12345',
                                roles: ['administrator']
                            }, function (err, result) {
                                if (err) return console.log(err);
                            });
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