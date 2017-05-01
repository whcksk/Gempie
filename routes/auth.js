var express = require('express');
var router = express.Router();

//var passport = require('../config/passport');
var passport = require('../config/passport'); // passport 정리

var User = require("../models/user");

// GET 로그인 페이지
router.get('/login', function(req, res, next) {
  res.render("auth/login");
});

// POST 로그인 처리
router.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/auth/login',
                                   failureFlash: true })
);

// GET 회원가입 페이지
router.get('/signup', function(req, res, next) {
  res.render("auth/signup");
});

// POST 회원가입 처리
router.post('/signup', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var name = req.body.name;

  req.checkBody('username', '아이디를 입력해주세요.').notEmpty();
  req.checkBody('password', '비밀번호를 입력해주세요.').notEmpty();
  req.checkBody('name', '이름을 입력해주세요.').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    return res.render('auth/signup', { errors: errors });
  }

  var newUser = new User({
    username: username,
    password: password,
    name: name,
  });

  newUser.save(function(err, user) {
    if (err) {
      console.log(err);
      req.flash('error', err.message);
      return res.redirect('/auth/signup');
    }

    return res.redirect('/');
  });
});

// GET 로그아웃 처리
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;
