var express = require('express');
var passport = require('passport');
var app = module.exports = express();

app.use(passport.initialize());
app.use(app.router);

function init(context){
  // User creation
  app.post('/user/create', function(req, res){
    var result = handleUserCreate(req.body);
    if (!result.success) {

      req.sesion = req.session || {};
      req.session.error = result.message;

      //page(req, res, 'index', {});
      res.redirect('/');
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

  configurePassport(context);
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

function googleProfileToParseUser(identifier, profile){
  var password = identifier.split('?id=')[1];
  var email = profile.emails[0].value;

  var parseUser = {
    provider: 'google',
    openId: email,
    username: email,
    password: password,
    email: email,
    displayName: profile.displayName,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    secret: identifier
  };

  return parseUser;
}

function githubProfileToParseUser(identifier, profile){
  var email = profile.emails[0].value;

  var parseUser = {
    provider: 'github',
    openId: profile.id.toString(),
    username: profile.username,
    password: identifier,
    email: email,
    displayName: profile.displayName,
    firstName: "",
    lastName: "",
    secret: identifier
  };

  return parseUser;
}

function findOrCreateUser(user, params, context, done){
  context.db.getUsers(params, function(err, res, body, success) {
    var result = {
      success: success,
      user: null,
      message: ""
    };

    if (success && body.length) {
      result.user = body[0];
      done(err, result);
    }
    else {
      context.db.createUser(user, function(err, res, body, success) {
        if (err || !success) {
          result.success = body.success;
          result.message = body.error;
          done(null, result);
        } else {
          result.user = body;
          done(null, result);
        }
      });
    }
  });
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
      var user = googleProfileToParseUser(identifier, profile);

      var params = {
        where: {
          provider: 'google',
          openId: user.openId
        }
      };

      findOrCreateUser(user, params, context, done);
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

      var user = githubProfileToParseUser(accessToken, profile);
      var params = {
        where: {
          provider: 'github',
          openId: user.openId
        }
      };

      findOrCreateUser(user, params, context, done);
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

  app.get('/auth/google', passport.authenticate('google'));

  app.get('/auth/google/callback', function(req, res, next) {
    passport.authenticate('google', function(err, result, info) {
      return handleAuthCallback(result, req, res, next);
    })(req, res, next);
  });

  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/twitter/callback', passport.authenticate('twitter', { successReturnToOrRedirect: '/', failureRedirect: '/' }));

  app.get('/auth/github',passport.authenticate('github'));
  app.get('/auth/github/callback', function(req, res, next) {
    passport.authenticate('github', function(err, result, info) {
      return handleAuthCallback(result, req, res, next);
    })(req, res, next);
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

function handleAuthCallback(result, req, res, next){
    if (!result.success) {
        req.session.error = result.message;
        return res.redirect('/');
      }

      if (!result.user) {
        return res.redirect('/');
      }

      req.logIn(result.user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/');
      });
  }

module.exports.init = init;
