var passport = require('passport');
var User = require('../models/user.js');
const MeetupStrategy = require('passport-meetup').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err,user) {
        done(err,user);
    })
});

passport.use('meetup', new MeetupStrategy({
    consumerKey: process.env.meetupAPIKey,
    consumerSecret: process.env.meetupAPISecret,
    callbackURL: "/welcome"
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
        return done(null, profile);
    });
  }
));