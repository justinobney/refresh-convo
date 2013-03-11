var express = require('express');
var passport = require('passport');
var app = module.exports = express();

app.use(passport.initialize());
app.use(app.router);

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

// ================================================
// ============== user authentication =============
// ================================================
function configurePassport(context)
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

  // Catching the login
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

  app.get('/logout', function(req, res)
  {
    req.logOut();
    res.redirect('/');
  });
}

module.exports.configurePassport = configurePassport;
