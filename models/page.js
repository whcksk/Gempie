var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pageSchema = new Schema({
  name: String,
  workers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Page', pageSchema);
