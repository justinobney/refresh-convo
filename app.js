var _ = require('underscore');
var express = require('express');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var models = require('./lib/models');
var imageService = require('./lib/services/imageService');
var linkService = require('./lib/services/linkService');
var view;

module.exports = {
  init: function(context, callback) {
    // Create an Express app object to add routes to and add
    // it to the context
    var app = context.app = express();

    // The express "body parser" gives us the parameters of a 
    // POST request is a convenient req.body object
    app.use(express.bodyParser());

    // Get the view module from the context
    view = context.view;

    // We need cookie parsing support for Passport
    context.app.use(express.cookieParser());

    // Our user sessions should be authenticated with a secret unique to this project
    context.app.use(express.session({ secret: context.settings.sessionSecret })); //store: mongoStore

    // Serve static files (such as CSS and js) in this folder
    app.use('/static', express.static(__dirname + '/static'));

    // We must install passport's middleware before we can set routes that depend on it,
    // but after our static file configuration so that login is not mandatory to see 
    // nice chrome on the login page
    var auth = require('./lib/auth');
    app.use(auth);
    auth.init(context);

    // ================================================
    // ==================   ROUTES    =================
    // ================================================

    // Deliver a list of posts when we see just '/'
    app.get('/', function(req, res) {
      var data = {slots : {links : []}};

      if (req.user) {
        linkService.GetAll(function(links){
          data.slots.links = links;
          page(req, res, 'index', data);
        });
      } else {
        page(req, res, 'index', data);
      }
    });

    app.get('/chat', ensureLoggedIn('/'), function(req, res) {
      page(req, res, 'chat', {slots : {page: 'chat'}});
    });

    app.post('/link/create', function(req,res){
      var result = handleLinkCreate(req.body, req.user);
      if (result.success) {
        result.link.save(function(data){
          var objectId = data.objectId;

          console.log("Saving file to PARSE");
          imageService.SaveUrlScreenshot(data.url, data.title, function(parseFileInfo){

            console.log("PARSE file info");
            console.log(parseFileInfo.url);

            result.link.update({
                imageUrl: parseFileInfo.url
            }, function(err, res, body, success){
                console.log('object updated at = ', body.updatedAt);
            });
          });
          res.redirect('/');
        });
      } else {
        req.session.error = result.message;
        res.redirect('/');
      }
    });

    // catch user create post

    app.get('*', function(req, res) {
      page(req, res, '404', {});
    });

    function handleLinkCreate(form, user){
      var result = { success: true, message: 'Success', link: null };
      var messages = [];

      if ( !form['title'] || !form['url']) {
        result.success = false;
        messages.push("Missing required form values");
      }

      if ( form['url'].indexOf('http://') !== 0 ) {
        result.success = false;
        messages.push("Links must begin with http://");
      }

      if ( !result.success ) {
        result.message = messages.join('<br />');
      } else {
        result.link = models.Link.create(context.db, {
          title: form['title'],
          url: form['url'],
          description: form['description'],
          userId: user.objectId,
          userName: user.username
        });
      }

      return result;
    }

    // handle user create

    // A convenient way to send a page as part of the response.
    // Wraps view.page without forcing Express-specific code
    // into that module
    function page(req, res, template, data)
    {
      // Displaying the user's name or email address is a common requirement.
      // Make sure data.slots.user exists - but do it without clobbering if
      // someone has explicitly provided data.slots or data.slots.user already.
      // Ditto for the session

      _.defaults(data, { slots: {} });
      _.defaults(data.slots, { user: req.user, session: req.session });
      res.send(view.page(template, data));
    }

    // We didn't have to delegate to anything time-consuming, so
    // just invoke our callback now
    callback();
  }
};
