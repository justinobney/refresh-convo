// Settings for our app. The 'require' call in server.js returns
// whatever we assign to 'module.exports' in this file

var localbase = (process.env.C9_PROJECT) ? 'http://' + process.env.C9_PROJECT + '.' + process.env.C9_USER + '.c9.io' : 'http://127.0.0.1:3000';

module.exports = {
  twitter: {
    // You need to go to dev.twitter.com and register your own app to get these!
    consumerKey: 'BQivLThJOjZPET3uMYeNqw',
    consumerSecret: 'ZWuqetEzKriWgMlgyC2HeuSShj2OOHfExC76TSqLwA',
    // Hint: point this to 127.0.0.1 via /etc/hosts for easy testing with a
    // URL that Twitter will accept. On your production server change to 
    // a real hostname. I have two apps registered with Twitter,
    // justjs (the real one) and devjustjs (for testing on my own computer)
    callbackURL: localbase + '/auth/twitter/callback'
  },
  github: {
    clientID: '2e0f6c58f467c1545903',
    clientSecret: '260e64aa25f17f7e6c87659540d7cf7c18eaab74',
    callbackURL: localbase + "/auth/github/callback"
  },
  http: {
    port: process.env.PORT || 3000
  },
  // You should use a secret of your own to authenticate session cookies
  sessionSecret: 'sfjnrfunpiu',
  google: {
    returnURL: localbase + '/auth/google/callback',
    realm: localbase
  }
};
