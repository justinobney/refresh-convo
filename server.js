var async = require('async');
var Kaiseki = require('kaiseki');

// Settings for our application. We'll load them from a separate file -
// our first Node module. Use ./ to access a file in the current
// directory. Use them to start building our 'context' object, which
// provides access to all the important stuff we may need throughout
// the application

var context = {};
context.settings = require('./config/settings-local');
var APP_ID = '9YzDSC51NNz9Rbdb22k3gztMMBgmdvaRrS2gfa0L';
var REST_API_KEY ='tjMO8OKW0L7PnNc6o1ndJqGYj0uwsGP44jKxqS8G';
context.db = new Kaiseki(APP_ID, REST_API_KEY);

async.series([setupView, setupApp, listen], ready);

function setupView(callback)
{
  // Create the view object
  context.view = require('./view.js');
  // Serve templates from this folder
  context.view.init({viewDir: __dirname + '/views', cache: false}, callback);
}

function setupApp(callback)
{
  // Create the Express app object and load our routes
  context.app = require('./app.js');
  context.app.init(context, callback);
}

// Ready to roll - start listening for connections
function listen(callback)
{
  context.app.listen(context.settings.http.port);
  callback(null);
}

function ready(err)
{
  if (err)
  {
    throw err;
  }
  console.log("Ready and listening at http://127.0.01:" + context.settings.http.port);
}
