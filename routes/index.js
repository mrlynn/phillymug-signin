var express = require('express');
var router = express.Router();
var Attendee = require('../models/attendees.js');
var ObjectId = require('mongoose').Types.ObjectId; 
var getIP = require('ipware')().get_ip;
var passport = require('passport');
var passportMeetup = require( 'passport-meetup' );
const stitch = require("mongodb-stitch")
const client = new stitch.StitchClient('mugsignin-iszcm');

/* Authenticate Stitch */

client.authenticate('apiKey', process.env.apiKey).then(() => {
  console.log('Successfully authenticated as ' + client.authedId());
}).catch((err) => {
  console.error('Error authenticating: ' + err);
})

const db = client.service('mongodb', 'mongodb-atlas').db('mugsignin');

/* Let the Routing Begin! */
var headerImageSource = process.env.headerImageSource;
/*
 Index
*/

router.get('/', function(req, res, next) {
  var ip = req.connection.remoteAddress
  var ipInfo = getIP(req);
  var regd = req.cookies['pmug-registered-email'];
  if (regd) {
    return res.redirect('/already');    
  }
  var title = "Please Sign In";
  res.render('register',{
    headerImageSource: headerImageSource
  })
})
router.get('/login', function(req, res, next) {
  res.render('login/meetup',{
    headerImageSource: headerImageSource
  })
})
/*
 Already registered
*/
router.get('/already', function(req, res, next) {
  res.render('already', {
    headerImageSource: headerImageSource,
    postLoginMessage: process.env.postLoginMessage
  });
})
/*
 Registration Desk - used by someone running the MUG Event
*/
router.get('/registration-desk', function(req, res, next) {
  var title = "Welcome to PhillyMUG October"
  // client.login().then(() =>
  //   db.collection('attendees').find({})
  //   ).then(docs => {
  //     console.log("Found docs", docs)
  //     console.log("[MongoDB Stitch] Connected to Stitch")
  //     res.render('registration-desk', {
  //       attendees: docs,
  //       title: title
  //     });
  //   }).catch(err => {
  //     console.error(err)
  // });
  Attendee.find({}, function(err, docs) {
    res.render('registration-desk', {
        attendees: docs,
        headerImageSource: headerImageSource,        
        title: title
    });
  });
});
/* Receive post from an individual registrar */
router.post('/register', function(req, res, next) {
  var myData = new Attendee(req.body);
  console.log(JSON.stringify(myData));
  var ip = req.connection.remoteAddress  
  myData.ip = ip
  myData.save()
    .then(item => {
      res.cookie('pmug-registered-email', req.body.email);
      return res.redirect('/already');    
    })
    .catch(err => {
      res.status(400).send("unable to register " + JSON.stringify(err));
    });
})
/* Get Multi-signin */
router.post('/msignin', function(req, res, next) {
  var ip = req.connection.remoteAddress  ;
  rec = new Object();
  rec.fname = req.body.fname;
  rec.lname = req.body.lname;
  rec.email = req.body.email;
  rec.phone = req.body.phone;
  rec.company = req.body.company;
  rec.note = req.body.note;
  console.log(JSON.stringify(rec));
  var doc = new Attendee(rec);
  doc.save()
    .then(item => {
      return res.redirect('/registration-desk');
    })
    .catch(err => {
      res.status(400).send("unable to really write" + JSON.stringify(err));
  });
})
router.post('/delete', function(req, res, next) {
  var id = req.body.id;
  Attendee.remove({_id: id}, function(err, doc) {
    if (err) {
      res.statusCode(400).send("Unable to delete");
    }
    return res.redirect('/registration-desk');    
  })
})
router.post('/signin', function(req, res, next) {
  var email = req.body.email;
  var fname = req.body.fname;
  var lname = req.body.lname;
  var company = req.body.company;
  var phone = req.body.phone;
  var doc = {
    fname: fname,
    lname: lname,
    company: company,
    phone: phone,
    email: email
  }
  Attendee.insertMany(doc,function(err,result) {
    if (err) {
      res.send("error")
    } else {
      return res.redirect('/');    
    }
  })
})
router.get('/signout', function(req, res, next) {
  res.clearCookie('pmug-registered-email');
  return res.redirect('/');
})


/* GET Meetup View Page */
router.get('/meetup', function(req, res){
  res.render('meetup', { user: req.user });
});

router.get('/auth/meetup',
  passport.authenticate('meetup'),
  function(req, res){
  // The request will be redirected to Meetup for authentication, so this
  // function will not be called.
  }
);
router.get('/login/meetup',  
  passport.authenticate('meetup')
);

// handle the callback after facebook has authenticated the user
router.get('/login/meetup/callback',
  passport.authenticate('meetup', {
    successRedirect : '/meetup',
    failureRedirect : '/'
  })
);

module.exports = router;
