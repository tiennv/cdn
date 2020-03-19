var path = require('path'),
    mime = require('mime'),
    config = require('./config');

var myutil = {};

myutil.fileType = function (file_path) {

    var ext = path
        .extname(file_path)
        .replace('.', '')
        .toLowerCase();

    var isExtAllowed = config.allowed_ext.indexOf(ext);

    var request_mime = mime.getType(file_path);
    var isMimeAllowed = config.allowed_mime.indexOf(request_mime);

    if (isExtAllowed >= 0 && isMimeAllowed >= 0) {
        if (myutil.isImage(request_mime, ext) == true) {
            return 'image';
        }

        else if (myutil.isCss(request_mime, ext) == true) {
            return 'css';
        }

        else if (myutil.isJs(request_mime, ext) == true) {
            return 'js';
        }

        else {
            return 'application';
        }
    }
    return false;
};

myutil.isImage = function (mime, ext) {
    var imageMime = ['image/gif', 'image/bmp', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/photoshop', 'image/x-photoshop', 'image/psd', 'image/webp'];
    var imageExt = ['gif', 'bmp', 'jpeg', 'jpg', 'png', 'ppt', 'psd', 'webp'];

    var isInImageMime = imageMime.indexOf(mime);
    var isInImageExt = imageExt.indexOf(ext.toLowerCase());

    return (isInImageExt >= 0 && isInImageMime >= 0);
};

myutil.isCss = function (mime, ext) {
    var cssMime = ['text/css'];
    var cssExt = ['css'];

    var isInCssMime = cssMime.indexOf(mime);
    var isInCssExt = cssExt.indexOf(ext.toLowerCase());

    return (isInCssExt >= 0 && isInCssMime >= 0);
};

myutil.isJs = function (mime, ext) {
    var jsMime = ['application/x-javascript', 'application/javascript', 'application/ecmascript', 'text/javascript'];
    var jsExt = ['js'];

    var isInJsMime = jsMime.indexOf(mime);
    var isInJsExt = jsExt.indexOf(ext.toLowerCase());

    return (isInJsExt >= 0 && isInJsMime >= 0);
};

myutil.validFilename = function (filename) {
    var letters = /^[0-9a-zA-Z-]+$/;  //only accept alphabetical, numeric and - characters
    return (filename.value.match(letters));
};

myutil.validurl = function (url) {
    var forbid = ['../', '..%2F'];
    var bLength = forbid.length;

    for (var i = 0; i < bLength; i++) {
        if (url.indexOf(forbid[i]) >= 0) {
            return false
        }
    }
    return true
};

module.exports = myutil;
