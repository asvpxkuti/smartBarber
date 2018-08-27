var mongoose = require('mongoose');

var CustomerInfo = new mongoose.Schema({
  name: String,
  email: String,
  date:{type:Date},
  job:Object,
  submitted_date: {type: Date, default: Date.now()},
});

module.exports = mongoose.model('Client', CustomerInfo);
