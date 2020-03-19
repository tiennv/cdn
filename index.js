var express = require('express'),
    path = require('path'),
    fs = require('../fs'),
    async = require('async'),
    url = require('url'),
    gm = require('gm').subClass({imageMagick: true}),
    router = express.Router(),
    config = require('../config'),
    mutil = require('../mutil');

router.get(config.image_thumbs.nodejs_prefix.concat(':dimension/:yyyy/:mm/:dd/:file'), function (req, res) {

    res.redirect(
        path.join(
            config.image_thumbs.nodejs_prefix,
            req.params.dimension,
            '100',
            req.params.yyyy,
            req.params.mm,
            req.params.dd,
            req.params.file
        )
    );

});

router.get(config.image_thumbs.nodejs_prefix.concat(':dimension/:quality/:yyyy/:mm/:dd/:file'), function (req, res) {
    
    var rawFile = req.url
        .replace(config.image_thumbs.nodejs_prefix, config.image_thumbs.nginx_prefix)
        .replace('/resize/', config.root_path)
        .replace(req.params.dimension, '');



    var pathName = decodeURIComponent(url.parse(rawFile).pathname);

    var file = {
        fileName: path.basename(pathName),
        fileType: mutil.fileType(pathName),
        extension: path.extname(pathName),
        absolutePath: path.join(pathName)
    };



    var dimension;

    var origin_path,
        resized_path,
        origin_file,
        resized_file;

    origin_path = path.join(
        req.params.yyyy,
        req.params.mm,
        req.params.dd
    );

    resized_path = path.join(
        config.root_path,
        config.image_thumbs.nginx_prefix,
        req.params.dimension,
        req.params.quality,
        origin_path
    );

    resized_file = path.join(
        resized_path,
        file.fileName
    );

    origin_file = path.join(
        config.root_path,
        origin_path,
        file.fileName
    );

    async.waterfall([
            function (callback) {
                if (file.fileType !== 'image') {
                    callback(new Error('Not an image'));
                }
                else {
                    callback();
                }
            },
            function (callback) {
                dimension = req.params.dimension.split('_');

                if (config.image_thumbs.allowed_dimension.indexOf(req.params.dimension) === -1) {
                    callback(new Error('Dimension not allowed'));
                }
                else {
                    callback();
                }
            },
            function (callback) {
                if (config.image_thumbs.allowed_quality.indexOf(req.params.quality) === -1) {
                    callback(new Error('Quality not allowed'));
                }
                else {
                    callback();
                }
            },
            function (callback) {
                fs.stat(resized_file, function (err, stats) {
                    if (err) {
                        fs.mkdirSync(resized_path, config.image_thumbs.chmod, true);
                        fs.chmodSync(resized_path, config.image_thumbs.chmod);
                        fs.chownSync(resized_path, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                        callback(null, true);
                    }
                    else {
                        callback(null, false);
                    }
                })
            },
            function (needMakingThumb, callback) {

                if (needMakingThumb) {
                    var gmObj = gm(origin_file)
                        .strip()
                        .noProfile()
                        .compress('Zip')
                        .quality(req.params.quality);

                    if (file.extension != '.png') {
                        gmObj.flatten();
                    }

                    if (req.params.dimension === '0_0') {

                        gmObj
                            .write(resized_file,
                            function (err) {
                                if (err) {
                                    callback(err);
                                }
                                else {
                                    fs.chmodSync(resized_file, config.image_thumbs.chmod);
                                    fs.chownSync(resized_file, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                                    callback();
                                }
                            });

                    }
                    else {

                        gmObj
                            .resize(dimension[0], dimension[1])
                            .write(resized_file,
                            function (err) {
                                if (err) {
                                    callback(err);
                                }
                                else {
                                    fs.chmodSync(resized_file, config.image_thumbs.chmod);
                                    fs.chownSync(resized_file, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                                    callback();
                                }
                            });

                    }

                }
                else {
                    callback();
                }
            },
            function(callback){
                fs.stat(resized_file, function (err, stats) {
                    if (err) {
                        callback(null, false);
                    }
                    else {
                        callback(null, true);
                    }
                })
            }
        ],
        function (err, ioDone) {
            if (err || !ioDone) {
                res.redirect(config.image_not_exists);
            }
            else {
                res.redirect(req.url);
            }
        });

});

router.get(config.image_thumbs.nodejs_prefix.concat(':dimension/:quality/:affiliateId/:yyyy/:mm/:dd/:file'), function (req, res) {

    var rawFile = req.url
        .replace(config.image_thumbs.nodejs_prefix, config.image_thumbs.nginx_prefix)
        .replace('/resize/', config.root_path)
        .replace(req.params.dimension, '');

    var pathName = decodeURIComponent(url.parse(rawFile).pathname);

    var file = {
        fileName: path.basename(pathName),
        fileType: mutil.fileType(pathName),
        extension: path.extname(pathName),
        absolutePath: path.join(pathName)
    };

    var dimension;

    var origin_path,
        resized_path,
        origin_file,
        resized_file;

    origin_path = path.join(
        req.params.affiliateId,
        req.params.yyyy,
        req.params.mm,
        req.params.dd
    );

    resized_path = path.join(
        config.root_path,
        config.image_thumbs.nginx_prefix,
        req.params.dimension,
        req.params.quality,
        origin_path
    );

    resized_file = path.join(
        resized_path,
        file.fileName
    );

    origin_file = path.join(
        config.root_path,
        origin_path,
        file.fileName
    );

    async.waterfall([
            function (callback) {
                if (file.fileType !== 'image') {
                    callback(new Error('Not an image'));
                }
                else {
                    callback();
                }
            },
            function (callback) {
                dimension = req.params.dimension.split('_');

                if (config.image_thumbs.allowed_dimension.indexOf(req.params.dimension) === -1) {
                    callback(new Error('Dimension not allowed'));
                }
                else {
                    callback();
                }
            },
            function (callback) {
                if (config.image_thumbs.allowed_quality.indexOf(req.params.quality) === -1) {
                    callback(new Error('Quality not allowed'));
                }
                else {
                    callback();
                }
            },
            function (callback) {
                fs.stat(resized_file, function (err, stats) {
                    if (err) {
                        fs.mkdirSync(resized_path, config.image_thumbs.chmod, true);
                        fs.chmodSync(resized_path, config.image_thumbs.chmod);
                        fs.chownSync(resized_path, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                        callback(null, true);
                    }
                    else {
                        callback(null, false);
                    }
                })
            },
            function (needMakingThumb, callback) {
                if (needMakingThumb) {
                    var gmObj = gm(origin_file)
                        .strip()
                        .noProfile()
                        .compress('Zip')
                        .quality(req.params.quality);

                    if (file.extension != '.png') {
                        gmObj.flatten();
                    }

                    if (req.params.dimension === '0_0') {

                        gmObj
                            .write(resized_file,
                            function (err) {
                                if (err) {
                                    callback(err);
                                }
                                else {
                                    fs.chmodSync(resized_file, config.image_thumbs.chmod);
                                    fs.chownSync(resized_file, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                                    callback();
                                }
                            });

                    }
                    else {

                        gmObj
                            .resize(dimension[0], dimension[1])
                            .write(resized_file,
                            function (err) {
                                if (err) {
                                    callback(err);
                                }
                                else {
                                    fs.chmodSync(resized_file, config.image_thumbs.chmod);
                                    fs.chownSync(resized_file, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                                    callback();
                                }
                            });

                    }
                }
                else {
                    callback();
                }
            },
            function(callback){
                fs.stat(resized_file, function (err, stats) {
                    if (err) {
                        callback(null, false);
                    }
                    else {
                        callback(null, true);
                    }
                })
            }
        ],
        function (err, ioDone) {
            if (err || !ioDone) {
                res.redirect(config.image_not_exists);
            }
            else {
                res.redirect(req.url);
            }
        });

});

router.get('/*', function (req, res) {
    res.redirect(config.image_not_exists);
});

module.exports = router;


