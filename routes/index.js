var express = require('express');
var router = express.Router();
var Attendee = require('../models/attendees.js');
var ObjectId = require('mongoose').Types.ObjectId; 
var getIP = require('ipware')().get_ip;
/* GET home page. */
router.get('/', function(req, res, next) {
  var ip = req.connection.remoteAddress
  var ipInfo = getIP(req);
  var regd = req.cookies['pmug-registered-email'];
  if (regd) {
    return res.redirect('/already');    
  }
  var title = "Please Sign In";
  res.render('register')
})
router.get('/already', function(req, res, next) {
  res.render('already');
})
/* Get Registration Desk */
router.get('/registration-desk', function(req, res, next) {
  var title = "Welcome to PhillyMUG October"
  Attendee.find({}, function(err, docs) {
    res.render('registration-desk', {
        attendees: docs,
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
  var myData = new Attendee(req.body);
  myData.save()
    .then(item => {
      return res.redirect('/registration-desk');    
    })
    .catch(err => {
      res.status(400).send("unable to save to database");
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
module.exports = router;
