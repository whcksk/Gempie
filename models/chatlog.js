/**
 * Created by whcks on 2016-12-01.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatLogSchema = new Schema({
    cityName: String,
    data: String
});

module.exports = mongoose.model('ChatLog', chatLogSchema);
