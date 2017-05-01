var express = require('express');
var router = express.Router();

var Page = require("../models/page");
var Question = require("../models/question");
var User = require("../models/user");
var loginRequired = require("../config/auth").loginRequired;
var moment = require('moment');

/* show user's page list */
router.get('/', function(req, res, next) {
  User
    .find({username: req.user.username})
    .populate('pages')
    .exec(function (err, user) {
      console.log(user[0].pages);
      return res.render('pages/pagestart', { pages: user[0].pages });
    });
});

/* 새로운 페이지 작성 페이지*/
router.get('/makepage', function(req, res, next){
  return res.render('pages/makepage');
});

/* 새로운 페이지 생성 */
router.post('/makepage', function(req, res, next){

  var page_name = req.body.page_name;

  req.checkBody('page_name', '이름을 입력해주세요.').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    return res.render('pages/makepage', { errors: errors });
  }

  // 새로운 페이지 생성
  var newPage = new Page({
    name: page_name,
  });
  newPage.workers.push(req.user.id);

  newPage.save(function(err, page) {
    if (err) {
      console.log(err);
      req.flash('error', err.message);
      return res.redirect('/pages/makepage');
    }
    // 유저정보에 페이지 추가
    User.update({ username: req.user.username}, { $push: { pages: newPage.id }},
    function(err, user){
      if(err) console.log(err);
      else return res.redirect('/pages');
    });
  });
});

router.param('page_id', function(req, res, next, page_id){
  if(page_id == 0){}
  else{
    Page.findById(page_id, function(err, page){
      if(err) console.log(err);
      else req.page = page;
      return next();
    });
  }
});

router.get('/:page_id', function(req, res, next) {
  var paze = req.query.page;
  if (!paze){
    paze = 1;
  }
  var query = Question.find({ 'page': req.page.id });  //질문글들
  var options = {
    sort: { _id : -1 },
    populate: 'writer',
    lean: true,
    page: paze,
    limit: 10
  };
  Question.paginate(query, options, function (err, paging){
    if(err) console.log(err);
    return res.render('pages/page', { page: req.page, questions: paging.docs, paging: paging });
  });
});

/* 질문 등록 */
router.post('/:page_id/question', function(req, res, next) {
  var content = req.body.content;

  var question = new Question({page: req.params.page_id, writer: req.user.id, content: content});

  question.save(function (err) {
    User.update({username: req.user.username}, {$push: {questions: question}}, function(err, q){
      req.flash('success', '성공적으로 등록되었습니다');
      return res.redirect('/pages/' + req.params.page_id);
    });
  });
});

// 질문 클릭시 - GET
router.get('/:page_id/questions/:question_id', function(req, res, next) {
  var page_id = req.params.page_id;
  var question_id = req.params.question_id;

  console.log(req.page.name);
  Question
    .findById(question_id)
    .populate(['comments.writer', 'writer'])
    .exec(function(err, question){
      if(err) console.log(err);
      return res.render('pages/question_detail', { page: req.page, question: question });
    });
});

// 질문에 답변 등록 - POST
router.post('/:page_id/questions/:question_id', loginRequired(), function(req, res, next) {
  var question_id = req.params.question_id;

  Question.update({ _id: question_id }, { $push: { comments : { content : req.body.content, writer: req.user.id }}},
  function (err, question){
    if (err){
      console.log(err);
    }
    else{
      return res.redirect('/pages/' + req.params.page_id + '/questions/' + req.params.question_id);
    }
  });
});

// 질문 수정페이지 - GET
router.get('/:page_id/questions/:question_id/edit', function(req, res, next) {
  var question_id = req.params.question_id;

  Question
    .findById(question_id)
    .populate('writer')
    .exec(function (err, question) {
      return res.render('pages/question_detail_edit', { page : req.page, question: question });
    });
});

// 질문 수정 후 - POST
router.post('/:page_id/questions/:question_id/edit', function(req, res, next) {
  var question_id = req.params.question_id;

  Question.update({ _id: question_id }, { $set: { content : req.body.content }},
    function (err, question){
      if (err){
        console.log(err);
      }
      else{
        return res.redirect('/pages/' + req.params.page_id + '/questions/' + req.params.question_id);
      }
    });
});

// 질문 삭제 - GET
router.get('/:page_id/questions/:question_id/delete', function(req, res, next) {
  var question_id = req.params.question_id;

  Question.remove({ _id: question_id }, function (err, question){
      if (err){
        console.log(err);
      }
      else{
        return res.redirect('/pages/' + req.params.page_id);
      }
  });
});

// 질문의 코멘트 삭제 - GET
router.get('/:page_id/questions/:question_id/comments/:comment_id/delete', function(req, res, next) {
  var question_id = req.params.question_id;

  Question.update({ _id: question_id }, { $pull: { comments : { _id: req.params.comment_id }}},
    function (err, question){
      if (err){
        console.log(err);
      }
      else{
        return res.redirect('/pages/' + req.params.page_id + '/questions/' + req.params.question_id);
      }
    });
});





module.exports = router;
