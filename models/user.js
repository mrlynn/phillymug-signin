var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var random = require('mongoose-simple-random');

var userSchema = new Schema({
	resetPasswordToken: String,
  	resetPasswordExpires: Date,
	location: {
      type: { type: String },
	  coordinates: [ Number ]
	},
	email: {
		type: String,
		required: false
	},
	password: {
		type: String,
		required: false
	},
	first_name: {
		type: String,
		required: false
	},
	last_name: {
		type: String,
		required: false
	},
	facebook: {
		type: String,
		required: false
	},
	meetup: {
		type: String,
		required: false
	},
	profile: {
		name: String,
		gender: String,
		location: String,
		website: String,
		picture: String
	},
	tokens: Array
});
userSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.plugin(random);

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.encryptPassword = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null)
};

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);
