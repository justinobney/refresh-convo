// uploaded file details 
// { 
//   url: 'http://files.parse.com/c5b396ee-1ff8-4dd9-b632-cef7426e9cbc/237aedb8-cd13-480e-a365-bfa43ad5a4dc-image2.jpg',
//   name: '237aedb8-cd13-480e-a365-bfa43ad5a4dc-image2.jpg' 
// }

var Kaiseki = require('kaiseki');
var APP_ID = '9YzDSC51NNz9Rbdb22k3gztMMBgmdvaRrS2gfa0L';
var REST_API_KEY = 'tjMO8OKW0L7PnNc6o1ndJqGYj0uwsGP44jKxqS8G';
var kaiseki = new Kaiseki(APP_ID, REST_API_KEY);
var im = require('imagemagick');
var fs = require('fs');


var loadBase64Image = function (url, fileName, callback) {
    var request = require('request');
    request({
        url: url,
        encoding: null
    }, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var base64prefix = 'data:' + res.headers['content-type'] + ';base64,',
                image = body.toString('base64');
            if (typeof callback == 'function') {
                saveImageToParse(image, base64prefix, fileName, callback);
            }
        } else {
            callback({url: 'https://dl.dropbox.com/u/2857953/img/website_default.png'});
        }
    });
};

var saveImageToParse = function (image, prefix, fileName, callback) {
    var buf = new Buffer((prefix + image).replace(/^data:image\/\w+;base64,/, ""), 'base64');

    //resize then upload to parse
    im.crop({
        srcData: buf,
        width:   250,
        height: 250,
        gravity: "North"
    }, function(err, data){
        if (err) {
            console.error('Error processing image', err);
        } else {
            var timestamp = new Date().getTime();
            var path = __dirname + '/' + timestamp + "_" + fileName;

            console.log("Writing file to disk");
            fs.writeFileSync(path, data, 'binary');

            console.log("Uploading to parse.com");
            kaiseki.uploadFile(path, function (err, res, body, success) {
                fs.unlink(path, function (err) {
                    console.log('successfully deleted: ' + path);
                });

                if (success) {
                    callback(body);
                }
            });
        }
    });
};

module.exports.SaveUrlScreenshot = function(url, fileName, callback){
    var sanitizedFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
    var screenshotUrl = 'http://pinstamatic.com/api/snap?preview&render=website&url=' + url;
    loadBase64Image(screenshotUrl, sanitizedFileName, callback);
};
