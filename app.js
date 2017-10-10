var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
var options = {
  db: { native_parser: true },
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASS,
  authSource: 'admin'
}
if (process.env.MONGO_USER) {
  // console.log("USING MONGO_USER " + process.env.MONGO_USER);
  var URI = 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASS + '@localhost:27017/hackathon';
  mongoose.connect(URI, options);
} else {
  mongoose.connect('mongodb://localhost:27017/phillymug');
}
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error in app.js Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
