var Kaiseki = require('kaiseki');
var APP_ID = '9YzDSC51NNz9Rbdb22k3gztMMBgmdvaRrS2gfa0L';
var REST_API_KEY = 'tjMO8OKW0L7PnNc6o1ndJqGYj0uwsGP44jKxqS8G';
var kaiseki = new Kaiseki(APP_ID, REST_API_KEY);

var url = 'http://pinstamatic.com/api/snap?preview&render=website&url=jobney-refresh.herokuapp.com';

var loadBase64Image = function (url, callback) {
    var request = require('request');
    request({
        url: url,
        encoding: null
    }, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var base64prefix = 'data:' + res.headers['content-type'] + ';base64,',
                image = body.toString('base64');
            if (typeof callback == 'function') {
                callback(image, base64prefix);
            }
        } else {
            throw new Error('Can not download image');
        }
    });
};

loadBase64Image(url, function (image, prefix) {
    var buf = new Buffer((prefix + image).replace(/^data:image\/\w+;base64,/, ""), 'base64');
    kaiseki.uploadFileBuffer(buf, 'image/jpeg', 'image2.jpg', function (err, res, body, success) {
        console.log('uploaded file details', body);
        // uploaded file details 
        // { 
        //   url: 'http://files.parse.com/c5b396ee-1ff8-4dd9-b632-cef7426e9cbc/237aedb8-cd13-480e-a365-bfa43ad5a4dc-image2.jpg',
        //   name: '237aedb8-cd13-480e-a365-bfa43ad5a4dc-image2.jpg' 
        // }
    });
});
