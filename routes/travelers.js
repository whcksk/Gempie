var express = require('express');
var router = express.Router();

var User = require("../models/user");
var City = require("../models/city");
var Plan = require("../models/plan");

router.param('username', function (req, res, next, username) {
  User.findOne({ username: username }, function (err, user) {
    if (err) { return res.send(err); }
    if (!user) {
      req.flash('error', '존재하지 않는 회원입니다.');
      return res.redirect('/');
    }
    req.traveler = user;
    return next();
  });
});

router.get('/:username', function(req, res, next) {
  if (req.user.username == req.traveler.username) {
    return res.redirect('/user/profile');
  }
  
  Plan.find({ traveler: req.traveler.id })
      .populate('city')
      .sort({ start_date : 'asc'})
      .exec(function(err, plan){
        if (!err){
          if (plan){
            res.render('travelers/profile', { traveler: req.traveler, plans: plan });
          }
          else{
            res.render('travelers/profile', { traveler: req.traveler, plans: "There is no data" });
          }
        }
        else{
          req.flash('error', 'Error in Plan.find');
          res.redirect('/travelers/' + req.user.username);
        }
      });
});

module.exports = router;
