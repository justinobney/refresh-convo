// Settings for our app. The 'require' call in server.js returns
// whatever we assign to 'module.exports' in this file

module.exports = {
  twitter: {
    // You need to go to dev.twitter.com and register your own app to get these!
    consumerKey: 'BQivLThJOjZPET3uMYeNqw',
    consumerSecret: 'ZWuqetEzKriWgMlgyC2HeuSShj2OOHfExC76TSqLwA',
    // Hint: point this to 127.0.0.1 via /etc/hosts for easy testing with a
    // URL that Twitter will accept. On your production server change to 
    // a real hostname. I have two apps registered with Twitter,
    // justjs (the real one) and devjustjs (for testing on my own computer)
    callbackURL: 'http://127.0.0.1:3000/auth/twitter/callback'
  },
  github: {
    //var GITHUB_CLIENT_ID = "26504acf98eae0ca8245";
    //var GITHUB_CLIENT_SECRET = "7dbc72cd458e1258d640a8648d5c85e61ded76dc";
    clientID: '26504acf98eae0ca8245',
    clientSecret: '7dbc72cd458e1258d640a8648d5c85e61ded76dc',
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
  },
  http: {
    port: process.env.PORT || 3000
  },
  // You should use a secret of your own to authenticate session cookies
  sessionSecret: 'sfjnrfunpiu',
  google: {
    returnURL: 'http://127.0.0.1:3000/auth/google/callback',
    realm: 'http://127.0.0.1:3000/'
  }
};
