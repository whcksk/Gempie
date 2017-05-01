var express = require('express');
var router = express.Router();

var Feed = require("../models/feed");
var Plan = require("../models/plan");
var Question = require('../models/question');

var moment = require('moment');

/* GET home page. */
router.get('/home', function(req, res, next) {
  Question
    .find({})
    .sort({ _id : -1 })
    .limit(5)
    .populate('page')
    .populate('writer')
    .exec(function (err, questions) {
      return res.render('index', { questions: questions });
    });
  //res.render('index', { title: 'Hell' });
});

module.exports = router;
