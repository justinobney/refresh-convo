var Kaiseki = require('kaiseki');
var APP_ID = '9YzDSC51NNz9Rbdb22k3gztMMBgmdvaRrS2gfa0L';
var REST_API_KEY ='tjMO8OKW0L7PnNc6o1ndJqGYj0uwsGP44jKxqS8G';
var db = new Kaiseki(APP_ID, REST_API_KEY);

module.exports = {
	GetAll : function(){},
	GetAllByUser : function(userId){},
	Add : function(link){},
	Update : function(objectId, link){},
	Delete : function(objectId){}
};
