var _ = require('underscore');
var express = require('express');
var passport = require('passport');
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
    configurePassport();

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

    app.post('/user/create', function(req, res){
      var result = handleUserCreate(req.body);
      if (!result.success) {

        req.sesion = req.session || {};
        req.session.error = result.message;

        page(req, res, 'index', {});
      } else {
        context.db.createUser({
            username: req.body['username'],
            password: req.body['password'],
            email: req.body['email']
          },
          function(err, response, body, success) {
            if ( !success ) {
              req.session.error = "Something went wrong..";
              res.redirect('/');
            } else {
              var user = transformParseUserToProfile(body);
              req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/');
              });
            }
        });
      }
    });

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

    function handleUserCreate(form){
      var result = { success: true, message: '' };
      var messages = [];

      if ( !form['email'] || !form['username'] || !form["password"] || !form["password-2"] ) {
        result.success = false;
        messages.push("Missing form values");
      }

      if ( form["password"] !== form["password-2"] ) {
        result.success = false;
        messages.push("Password mismatch");
      }

      result.message = messages.join('<br />');

      return result;
    }

    function transformParseUserToProfile(parseUser){
      var user = { 'email': parseUser.email, 'displayName': parseUser.username || "Name not set" };
      return user;
    }

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

    // ================================================
    // ============== user authentication =============
    // ================================================
    function configurePassport()
    {
      var GoogleStrategy = require('passport-google').Strategy;
      passport.use(new GoogleStrategy(
        context.settings.google,
        function(identifier, profile, done) {
          // Create a user object from the most useful bits of their profile.
          // With google their email address is their unique id. 
          var user = { 'email': profile.emails[0].value, 'displayName': profile.displayName };
          done(null, user);
        }
      ));

      var TwitterStrategy = require('passport-twitter').Strategy;

      passport.use(new TwitterStrategy(
        context.settings.twitter,
        function(token, tokenSecret, profile, done) {
          var user = { 'email': 'Not returned', 'displayName': profile.displayName };
          return done(null, user);
        }
      ));

      var GitHubStrategy = require('passport-github').Strategy;
      passport.use(new GitHubStrategy(
        context.settings.github,
        function(accessToken, refreshToken, profile, done) {
          var user = { 'email': profile.emails[0].value, 'displayName': profile.displayName };
          done(null, user);
        }
      ));

      var LocalStrategy = require('passport-local').Strategy;
      passport.use(new LocalStrategy(
        function(username, password, done) {
          // Find the user from your DB (Parse)
          context.db.loginUser(username, password, function(err, res, body, success) {
            if (success) {
              var profile = transformParseUserToProfile(body);
              done(err, profile);
            } else {
              return done(null, false, { message: body.error });
            }
          });
        }
      ));

      // It's up to us to tell Passport how to store the current user in the session, and how to take
      // session data and get back a user object. We could store just an id in the session and go back
      // and forth to the complete user object via MySQL or MongoDB lookups, but since the user object
      // is small, we'll save a round trip to the database by storign the user
      // information directly in the session in JSON string format.

      passport.serializeUser(function(user, done) {
        done(null, JSON.stringify(user));
      });

      passport.deserializeUser(function(json, done) {
        var user = JSON.parse(json);
        if (user)
        {
          done(null, user);
        }
        else
        {
          done(new Error("Bad JSON string in session"), null);
        }
      });

      app.use(passport.initialize());
      app.use(passport.session());

      // Borrowed from http://passportjs.org/guide/google.html

      // Redirect the user to Google for authentication.  When complete, Google
      // will redirect the user back to the application at
      // /auth/twitter/callback
      app.get('/auth/google', passport.authenticate('google'));

      // Twitter will redirect the user to this URL after approval.  Finish the
      // authentication process by attempting to obtain an access token.  If
      // access was granted, the user will be logged in.  Otherwise,
      // authentication has failed.
      app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/' }));

      app.get('/auth/twitter', passport.authenticate('twitter'));
      app.get('/auth/twitter/callback', passport.authenticate('twitter', { successReturnToOrRedirect: '/', failureRedirect: '/' }));

      app.get('/auth/github',passport.authenticate('github'));
      app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
        function(req, res) {
          // Successful authentication, redirect home.
          res.redirect('/');
        });

      app.post('/', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
          if (err) { return next(err); }

          if (!user) {
            req.session.error = info.message;
            return res.redirect('/');
          }

          req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/');
          });
        })(req, res, next);
      });

      app.post('/',
        passport.authenticate('local', { failureRedirect: '/' }),
        function(req, res) {
          res.redirect('/');
        }
      );

      app.get('/logout', function(req, res)
      {
        req.logOut();
        res.redirect('/');
      });
    }
  }
};
