var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  writer: { type: Schema.Types.ObjectId, ref: 'User' },
  content: String,
  good: { type: Number, default: 0 },
  created_at: { type : Date , default : Date.now },
  update_at: { type : Date , default : Date.now },
});

var questionSchema = new Schema({
  page: { type: Schema.Types.ObjectId, ref: 'Page' },
  writer: { type: Schema.Types.ObjectId, ref: 'User' },
  answer: String,
  content: String,
  imageURL: String,
  tags: [String],
  comments: [commentSchema],
  created_at: { type : Date , default : Date.now },
  update_at: { type : Date , default : Date.now },
});

questionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Question', questionSchema);
