var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	fname:{
        type: String
    },
    lname: {
        type: String
    },
    ip: {
        type: String
    },
	email: {
        type: String
    },
    company: {
        type: String
    },
    phone: {
        type: String
    },
	created: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Attendee', schema);