var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	fname:{
        type: String
    },
    lname: {
        type: String
    },
    note: {
        type: String,
        required: false
    },
    ip: {
        type: String,
        required: false
    },
	email: {
        type: String,
        required: false
    },
    company: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
	created: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Attendee', schema);