var express = require('express');
var router = express.Router();
var crypto = require('crypto');

var User = require("../models/user");
var Question = require('../models/question');

var loginRequired = require("../config/auth").loginRequired;

router.get('/', function(req, res, next) {
  res.redirect('/user/plans');
});

router.get('/profile', function(req, res, next){
  return res.render('user/profile', {});
});

router.get('/profile/edit', function(req, res, next){
  return res.render('user/profile_edit');
});


router.post('/profile', function(req, res, next){
  var name = req.body.name;
  var email = req.body.email;
  var intro = req.body.intro;

  req.checkBody('name', '이름을 입력해주세요.').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    return res.render('user/profile_edit', { errors: errors });
  }

  User.update({ username : req.user.username }, { name: name,
    email : email , intro: intro },
    function (err, user){
    return res.redirect('/user/profile');
  });
});

router.get('/:username', function(req, res, next){
  User.find({username: req.params.username}, function(err, user){
    if(err) {
      console.log('존재하지 않는 회원입니다.');
      return res.redirect('/');
    }
    else res.render('user/');
  });
});

router.get('/:username/questions',function(req, res, next){
  User
    .find({username: req.params.username})
    .sort({ _id : -1 })
    .populate('questions')
    .exec(function (err, users) {
      console.log(users);
      return res.render('user/questions', { writers: users });
    });
});

module.exports = router;
