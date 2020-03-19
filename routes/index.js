var express = require('express'),
    path = require('path'),
    fs = require('../fs'),
    async = require('async'),
    url = require('url'),
    gm = require('gm').subClass({imageMagick: true}),
    router = express.Router(),
    config = require('../config'),
    mutil = require('../mutil');


router.get(config.image_thumbs.nodejs_prefix.concat(':dimension/:quality/:image_folder/:yyyy/:mm/:file'), function (req, res) {
    console.log(req.url);
    console.log(req.baseUrl);
    console.log(req.originalUrl);
    var rawFile = req.url
        .replace(req.params.dimension, config.root_path)
        .replace(req.params.quality, '')
        .replace('///', '/')
        .replace('//', '/');   

    console.log("RAW FILE " + rawFile);        
    var pathName = decodeURIComponent(url.parse(rawFile).pathname);    

    var file = {
        fileName: path.basename(pathName),
        fileType: mutil.fileType(pathName),
        extension: path.extname(pathName),
        absolutePath: path.join(pathName)
    };

    var dimension;
    var compressType = 'Zip';

    var origin_path,
        resized_path,
        origin_file,
        resized_file;        

    if(file.extension=='.webp'){        
        compressType='WebP';                
    }

    origin_path = path.join(
        req.params.image_folder,        
        req.params.yyyy,
        req.params.mm
    );

    resized_path = path.join(
        config.optimize_path,
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

    console.log("RAW FILE 1",rawFile);
    console.log("FILENAME 1", file.fileName);
    console.log("RESIZE FILE 1", resized_file);
    console.log("ORIGIN FILE 1", origin_file);

    // check file exists
    if(file.extension=='.webp'){        
        console.log("check extentsion", config.allowed_ext.length);
        for(var i = 0; i< config.allowed_ext.length; i++){
            var realFile = path.join(config.root_path, origin_path, file.fileName.replace(file.extension, "." + config.allowed_ext[i]));
            console.log("Real file 1:", realFile);
            if(fs.existsSync(realFile)){
                origin_file = realFile;
                console.log("Origin file 1:", origin_file);
                break;
            }
        }
    }

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
                console.log("================CALLBACK 1========================");
                console.log(resized_file);
                fs.stat(resized_file, function (err, stats) {
                    console.log("ERR", err);
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
                console.log("================NEED MAKE THUMB="+ needMakingThumb +"========================");            
                console.log(origin_file);
                if (needMakingThumb) {                    
                    var gmObj = gm(origin_file)
                        .strip()
                        .noProfile()
                        .compress(compressType)
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
                                    if(file.extension=='.webp'){                                    
                                        gmObj
                                            .stream('webp');
                                            //.pipe(fs.createWriteStream(resized_file));
                                    }
                                    
                                    fs.chmodSync(resized_file, config.image_thumbs.chmod);
                                    fs.chownSync(resized_file, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                                    
                                     callback();
                                 }
                             });
                    }
                    else {
                        if(dimension[0]=='0'){                        
                            gmObj
                            .resize(null, dimension[1])
                            .write(resized_file,
                            function (err) {
                                if (err) {                      
                                    callback(err);
                                }
                                else {               
                                    if(file.extension=='.webp'){                                    
                                        gmObj
                                            .stream('webp');
                                            //.pipe(fs.createWriteStream(resized_file));
                                    }
                                    
                                    fs.chmodSync(resized_file, config.image_thumbs.chmod);
                                    fs.chownSync(resized_file, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                                    callback();
                                    
                                }
                            });
                        }
                        else if(dimension[1]=='0'){                        
                            gmObj
                            .resize(dimension[0])
                            .write(resized_file,
                            function (err) {
                                if (err) {                                
                                    callback(err);
                                }
                                else {    
                                    if(file.extension=='.webp'){                                    
                                        gmObj
                                            .stream('webp');
                                            //.pipe(fs.createWriteStream(resized_file));
                                    }
                                    
                                    fs.chmodSync(resized_file, config.image_thumbs.chmod);
                                    fs.chownSync(resized_file, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                                    callback();
                                    
                                }
                            });
                        }
                        else{
                            console.log(dimension[0], dimension[1]);
                             gmObj                        
                             .resize(dimension[0], dimension[1])
                             .write(resized_file,
                             function (err) {
                                 console.log("ERROR 1", err);
                                 if (err) {                                 
                                     callback(err);
                                 }
                                 else {      
                                    if(file.extension=='.webp'){                                    
                                        gmObj
                                            .stream('webp');
                                            //.pipe(fs.createWriteStream(resized_file));
                                    }
                                    
                                    fs.chmodSync(resized_file, config.image_thumbs.chmod);
                                    fs.chownSync(resized_file, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                                    callback();
                                    
                                 }
                             });                           
                            
                        }
                    }
                }
                else {
                    callback();
                }
            },
            function (callback) {     
                console.log("CALL BACK");           
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
            console.log("ERORR 11 ", err, ioDone);
            if (err || !ioDone) {
                res.redirect(config.image_not_exists);
            }
            else {
                res.redirect(req.url);
            }

        });

});

router.get(config.image_thumbs.nodejs_prefix.concat(':dimension/:quality/:yyyy/:mm/:file'), function (req, res) {
    var rawFile = req.url
        .replace(req.params.dimension, config.root_path)
        .replace(req.params.quality, '')
        .replace('///', '/')
        .replace('//', '/');   

    var pathName = decodeURIComponent(url.parse(rawFile).pathname);   
    

    var file = {
        fileName: path.basename(pathName),
        fileType: mutil.fileType(pathName),
        extension: path.extname(pathName),
        absolutePath: path.join(pathName)
    };    

    var dimension;
    var compressType = 'Zip';

    var origin_path,
        resized_path,
        origin_file,
        resized_file;               

    if(file.extension=='.webp'){        
        compressType='WebP';               
    }

    origin_path = path.join(        
        req.params.yyyy,
        req.params.mm
    );

    resized_path = path.join(
        config.optimize_path,
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

    console.log("RAW FILE 2",rawFile);
    console.log("FILENAME 2", file.fileName, file.extension);
    console.log("RESIZE FILE 2", resized_file);
    console.log("ORIGIN FILE 2", origin_file);
    console.log("CHECK EXTENSION 2", file.extension=='.webp');
    // check file exists
    if(file.extension=='.webp'){        
        //console.log("check extentsion", config.allowed_ext.length);
        for(var i = 0; i< config.allowed_ext.length; i++){
            var realFile = path.join(config.root_path, origin_path, file.fileName.replace(file.extension, "." + config.allowed_ext[i]));            
            console.log("REAL FILE 2:", realFile, origin_path, file.fileName, file.fileName.replace(file.extension, "." + config.allowed_ext[i]), file.extension);           
            var checkExists = fs.existsSync(realFile);           
            console.log("=========================="+ checkExists +"=============================");         
            if(checkExists) {
                console.log("==========================START=============================");                
                console.log("Origin file 2.1:", origin_file, realFile);                                
                origin_file = realFile;                
                console.log("Origin file 22:", origin_file);                                
                console.log("==========================END=============================");
                break;
            }
        }
    }

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
            console.log("================CALLBACK========================");
            fs.stat(resized_file, function (err, stats) {     
                console.log("================ERROR========================");  
                console.log(stats);
                console.log(err);         
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
                console.log("================NEED MAKE THUMB WEBP 2========================");
                console.log(origin_file);               
                var gmObj = gm(origin_file)
                    .strip()
                    .noProfile()
                    .compress(compressType)
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
                                if(file.extension=='.webp'){                                    
                                    gmObj
                                        .stream('webp');
                                        //.pipe(fs.createWriteStream(resized_file));
                                }
                                
                                fs.chmodSync(resized_file, config.image_thumbs.chmod);
                                fs.chownSync(resized_file, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                                callback();
                                
                            }
                        });
                }
                else {                    
                    if(dimension[0]=='0'){                        
                        gmObj
                        .resize(null, dimension[1])
                        .write(resized_file,
                        function (err) {
                            if (err) {                      
                                callback(err);
                            }
                            else {     
                                if(file.extension=='.webp'){                                    
                                    gmObj
                                        .stream('webp');
                                        //.pipe(fs.createWriteStream(resized_file));
                                }
                                
                                fs.chmodSync(resized_file, config.image_thumbs.chmod);
                                fs.chownSync(resized_file, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                                callback();
                                
                            }
                        });
                    }
                    else if(dimension[1]=='0'){                        
                        gmObj
                        .resize(dimension[0])
                        .write(resized_file,
                        function (err) {
                            if (err) {                                
                                callback(err);
                            }
                            else {        
                                if(file.extension=='.webp'){                                    
                                    gmObj
                                        .stream('webp');
                                        //.pipe(fs.createWriteStream(resized_file));
                                }                                
                                fs.chmodSync(resized_file, config.image_thumbs.chmod);
                                fs.chownSync(resized_file, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                                callback();
                                
                            }
                        });
                    }
                    else{          
                        debugger;              
                         gmObj                        
                         .resize(dimension[0], dimension[1])                        
                         .write(resized_file,
                         function (err) {
                             if (err) {                                 
                                 callback(err);
                             }
                             else {        
                                if(file.extension=='.webp'){                                                   
                                    gmObj                                                    
                                        .stream('webp');
                                        //.pipe(fs.createWriteStream(resized_file));
                                }
                                
                                fs.chmodSync(resized_file, config.image_thumbs.chmod);
                                fs.chownSync(resized_file, config.image_thumbs.chown.uid, config.image_thumbs.chown.gid);
                                callback();
                                
                             }
                         });                                                  
                    }
                }
            }
            else {
                callback();
            }
        },
        function (callback) {            
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


