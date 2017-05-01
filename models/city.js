var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var citySchema = new Schema({
  _id: String,
  name: String,
  location: {
    lat: Number,
    lng: Number,
  },
  country: {
    code: { type: String, lowercase: true },
    name: String,
  },
});

module.exports = mongoose.model('City', citySchema);
