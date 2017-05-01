var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var planSchema = new Schema({
  city: { type: String, ref: 'City' },
  traveler: { type: Schema.Types.ObjectId, ref: 'User' },
  start_date: Date,
  end_date: Date,
  content: String,
  find_companion: { type : Boolean, default : false },
  created_at: { type : Date, default : Date.now },
  update_at: { type : Date, default : Date.now },
});

module.exports = mongoose.model('Plan', planSchema);
