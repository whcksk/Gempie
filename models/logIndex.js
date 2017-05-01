/**
 * Created by whcks on 2016-12-01.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logIndex = new Schema({
    cityName: String,
    fileIndex: Number,
});

module.exports = mongoose.model('LogIndex', logIndex);
