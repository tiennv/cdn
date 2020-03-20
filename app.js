process.on('uncaughtException', function (err) {
    console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
    process.exit(1);
});

var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var moment = require('moment');
var util = require('util');
var sprintf = require('sprintf');
var fs = require('fs');

var config = require('./config');

var http = require('http');

var routes = require('./routes/index');

var app = express();

var server = http.createServer(app);

app.set('view engine', 'pug');

// serve static files from the `public` folder
app.use(express.static(__dirname + '/'));

app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(function (req, res, next) {
    var start = Date.now();

    res.on('finish', function () {

        var $time_iso8601 = moment().format(),
            $remote_addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '-',
            $request_time = Date.now() - start,
            $request = {
                method: req.method,
                url: req.url,
                httpVersion: req.httpVersion
            },
            $status = res.statusCode,
            $http_referer = req.headers['referer'] || req.headers['referrer'] || '-',
            $body_bytes_sent = req.socket.bytesWritten,
            $http_user_agent = req.headers['user-agent'],
            $resource_exists = doesExist(config.root_path.substring(0, config.root_path.length - 1) + req.url) ? 'HIT' : 'MISS';

        console.log(
            sprintf(
                '[%s] %s (%s) "%s" %s "%s" %s "%s" %s',
                $time_iso8601,
                $remote_addr,
                $request_time,
                ($request.method + ' ' + $request.url + ' HTTP/' + $request.httpVersion),
                $status,
                $http_referer,
                $body_bytes_sent,
                $http_user_agent,
                $resource_exists
            )
        );

    });
    next();
});


function doesExist(firstInitial) {
    try {
        fs.statSync('./cmds/' + firstInitial + '.json')
        return true
    } catch (err) {
        return !(err && err.code === 'ENOENT');
    }
}

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    console.log(err);
});

server.listen(config.port, function () {
    console.log('=====', 'File Server listening on port', config.port, '=====');
});

module.exports = app;
