var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  traveler: { type: Schema.Types.ObjectId, ref: 'User' },
  content: String,
  created_at: { type : Date , default : Date.now },
  update_at: { type : Date , default : Date.now },
});

var feedSchema = new Schema({
  city: { type: String, ref: 'City' },
  traveler: { type: Schema.Types.ObjectId, ref: 'User' },
  content: String,
  comments: [commentSchema],
  created_at: { type : Date , default : Date.now },
  update_at: { type : Date , default : Date.now },
});

feedSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Feed', feedSchema);
