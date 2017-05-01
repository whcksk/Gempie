var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: { type: String, unique: true, required: true }, // 아이디
  password: { type: String, required: true }, // 비밀번호
  salt: String,
  name: { type: String, required: true },
  email: String,
  intro: String,
  pages: [{ type: Schema.Types.ObjectId, ref: 'Page' }],
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  // birthday: String,
  created_at: { type : Date , default : Date.now },
  update_at: { type : Date , default : Date.now },
});

// document 생성 전 pre-save method
userSchema.pre('save', function(next){
  if(this.password) {
    this.salt = new Buffer(crypto.randomBytes(16).toString('base64'),
      'base64');
    this.password = this.hashPassword(this.password);
  }
  next();
});

// password hash 처리
userSchema.methods.hashPassword = function(password) {
  return crypto.pbkdf2Sync(password, this.salt, 10000, 64).
  toString('base64');
};

// validate password
userSchema.methods.validPassword = function(password) {
  return this.password === this.hashPassword(password);
};

// for SNS(facebook, twitter, gitHub)
userSchema.statics.findUniqueUserid = function(userid, suffix, callback) {
  var _this = this;
  var possibleUserid = userid + (suffix || '');

  _this.findOne({
    userid : possibleUserid
  }, function(err,user) {
    if(!err) {
      if(!user) {
        callback(possibleUserid);
      }else{
        return _this.findUniqueUserid(userid, (suffix || 0) + 1, callback);
      }
    }else{
      callback(null);
    }
  });
};

// to JSON
//userSchema.set('toJSON',{ getters : true , virtuals : true});
module.exports = mongoose.model('User' , userSchema);
