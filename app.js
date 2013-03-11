var _ = require('underscore');
var express = require('express');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
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
    auth.configurePassport(context);

    // ================================================
    // ==================   ROUTES    =================
    // ================================================

    // Deliver a list of posts when we see just '/'
    app.get('/', function(req, res) {
      page(req, res, 'index', {});
    });

    app.get('/chat', ensureLoggedIn('/'), function(req, res) {
      page(req, res, 'chat', {slots : {page: 'chat'}});
    });

    // catch user create post

    app.get('*', function(req, res) {
      notFound(res);
    });

    // The notFound function is factored out so we can call it
    // both from the catch-all, final route and if a URL looks
    // reasonable but doesn't match any actual posts

    function notFound(res)
    {
      res.send('<h1>Page not found.</h1>', 404);
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
