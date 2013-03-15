var Kaiseki = require('kaiseki');
var APP_ID = '9YzDSC51NNz9Rbdb22k3gztMMBgmdvaRrS2gfa0L';
var REST_API_KEY ='tjMO8OKW0L7PnNc6o1ndJqGYj0uwsGP44jKxqS8G';
var _Kaiseki = new Kaiseki(APP_ID, REST_API_KEY);

module.exports = {
    GetAll : function(cb){
        // query with parameters
        var params = {
          //where: { breed: "Chow Chow" },
          order: '-updatedAt'
        };

        _Kaiseki.getObjects('Link', params, function(err, res, body, success) {
            if (err) throw err;
            cb(body);
        });
    },
    GetAllByUser : function(userId){},
    Add : function(link){},
    Update : function(objectId, link){},
    Delete : function(objectId){}
};
