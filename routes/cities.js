var express = require('express');
var router = express.Router();

var GooglePlaces = require('node-googleplaces');
var places = new GooglePlaces('AIzaSyAnhXCqLbWgRR84ciGzGJ4z9wL-MQsPBok');

var City = require("../models/city");
var Feed = require("../models/feed");
var Plan = require("../models/plan");

var loginRequired = require("../config/auth").loginRequired;

var moment = require('moment');
require('moment-range');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/');
});

router.param('city_id', function (req, res, next, city_id) {
  City.findById(city_id, function(err, city){
    if (!err) {
      if (city) {
        req.city = city;
        return next();
      } else {
        places.details({placeid: city_id, language: 'ko'}, function(error, response) {
          var place = response.body.result;
          if (place) {
            if (place.types.indexOf('locality') !== -1) {
              var country = {};

              for(var address_component of place.address_components) {
                if (address_component.types.indexOf('country') !== -1) {
                  country = {code: address_component.short_name.toLowerCase(), name: address_component.long_name};
                }
              }

              var newCity = new City({_id: place.place_id, name: place.name, location: place.geometry.location, country: country});

              newCity.save(function (err) {
                req.city = newCity;
                return next();
              });
            } else {
              req.flash('error', '잘못된 접근입니다.'); // locality가 아닌 경우 -> 도시가 아닌 경우
              return res.redirect('/');
            }
          } else {
            req.flash('error', '잘못된 접근입니다.'); // place_id가 아닌 경우
            return res.redirect('/');
          }
        });
      }
    }
  });
});

router.get('/:city_id', function(req, res, next) {
  var page = req.query.page;

  if (!page){
    page = 1;
  }

  var query = Feed.find({ 'city': req.city.id });
  var options = {
    sort: { _id : -1 },
    populate: 'traveler',
    lean: true,
    page: page,
    limit: 10
  };
  console.log(typeof(req.city));
  Feed.paginate(query, options, function (err, paging){
    return res.render('cities/feed', { city: req.city, feeds: paging.docs, paging: paging });
  });

});

router.get('/:city_id/chats', loginRequired(), function(req, res, next) {
  res.render('chats/client', { city: req.city }); //유저(나) 이름과 도시 정보 가져와야함
});

router.get('/:city_id/plans', function(req, res, next) {
  res.send(req.city);
});

// deprecated
/*
router.get('/:city_id/feeds', function(req, res, next) {
  Feed
    .find({ 'city': req.city.id })
    .populate('traveler')
    .sort({ _id : -1 })
    .exec(function (err, feeds) {
      return res.render('cities/feed', { city: req.city, feeds: feeds });
    });
});
*/

router.post('/:city_id/feeds', function(req, res, next) {
  var content = req.body.content;

  var feed = new Feed({city: req.city, traveler: req.user.id, content: content});

  feed.save(function (err) {
    req.flash('success', '성공적으로 등록되었습니다');
    return res.redirect('/cities/' + req.params.city_id);
  });
});

// 피드 클릭시 - GET
router.get('/:city_id/feeds/:feed_id', function(req, res, next) {
  var feed_id = req.params.feed_id;

  Feed
    .findById(feed_id)
    .populate(['comments.traveler', 'traveler'])
    .exec(function(err, feed){
      return res.render('cities/feed_detail', { city: req.city, feed: feed });
    });
});

// 피드에 코멘트 등록 - POST
router.post('/:city_id/feeds/:feed_id', loginRequired(), function(req, res, next) {
  var feed_id = req.params.feed_id;

  Feed.update({ _id: feed_id }, { $push: { comments : { content : req.body.content, traveler: req.user.id }}},
  function (err, feed){
    if (err){
      console.log(err);
    }
    else{
      return res.redirect('/cities/' + req.params.city_id + '/feeds/' + req.params.feed_id);
    }
  });

});

// 피드 수정페이지 - GET
router.get('/:city_id/feeds/:feed_id/edit', function(req, res, next) {
  var feed_id = req.params.feed_id;

  Feed
    .findById(feed_id)
    .populate('traveler')
    .exec(function (err, feed) {
      return res.render('cities/feed_detail_edit', { city : req.city, feed: feed });
    });
});

// 피드 수정 후 - POST
router.post('/:city_id/feeds/:feed_id/edit', function(req, res, next) {
  var feed_id = req.params.feed_id;

  Feed.update({ _id: feed_id }, { $set: { content : req.body.content }},
    function (err, feed){
      if (err){
        console.log(err);
      }
      else{
        return res.redirect('/cities/' + req.params.city_id + '/feeds/' + req.params.feed_id);
      }
    });
});

// 피드 삭제 - GET
router.get('/:city_id/feeds/:feed_id/delete', function(req, res, next) {
  var feed_id = req.params.feed_id;

  Feed.remove({ _id: feed_id }, function (err, feed){
      if (err){
        console.log(err);
      }
      else{
        return res.redirect('/cities/' + req.params.city_id);
      }
  });
});

// 피드의 코멘트 삭제 - GET
router.get('/:city_id/feeds/:feed_id/comments/:comment_id/delete', function(req, res, next) {
  var feed_id = req.params.feed_id;

  Feed.update({ _id: feed_id }, { $pull: { comments : { _id: req.params.comment_id }}},
    function (err, feed){
      if (err){
        console.log(err);
      }
      else{
        return res.redirect('/cities/' + req.params.city_id + '/feeds/' + req.params.feed_id);
      }
    });

});

router.get('/:city_id/travelers', function(req, res, next) {
  var start_date = req.query.start_date;
  var end_date = req.query.end_date;

  if (start_date && end_date) {
    var sdate = moment.utc(start_date, "YYYY-MM-DD");
    var edate = moment.utc(end_date, "YYYY-MM-DD");

    console.log(sdate);
    console.log(edate);

    Plan
      .find({city : req.city.id, start_date: {"$lte": edate}, end_date: {"$gte": sdate}})
      .populate('traveler')
      .sort({ start_date : 1 })
      .lean()
      .exec(function(err, plans){

      var range1 = moment.range(sdate, edate);
      console.log('range1' + range1.toArray('days'));

      plans.forEach(function(plan) {
        var range2 = moment.range(moment.utc(plan.start_date, "YYYY-MM-DD"), moment.utc(plan.end_date, "YYYY-MM-DD"));

        var intersect = range1.intersect(range2);
        console.log('intersect: ' + intersect);

        if(!intersect) {
          plan.intersect = 1;
        } else {
          plan.intersect = intersect.toArray('days').length;
        }
      });

      plans.sort(function(a, b){
        return b.intersect - a.intersect ;
      });

      return res.render('cities/traveler', {city: req.city, plans: plans, start_date: sdate, end_date: edate});
    });
  } else if (start_date) {
    var sdate = moment.utc(start_date, "YYYY-MM-DD");

    Plan
      .find({city : req.city.id, start_date: {"$lte": sdate}, end_date: {"$gte": sdate}})
      .populate('traveler')
      .sort({ start_date : 1 })
      .lean()
      .exec(function(err, plans){
        return res.render('cities/traveler', {city: req.city, plans: plans, start_date: sdate});
      });
  } else {
    // 기본
    var sdate = moment.utc(new Date(Date.now())).format("YYYY-MM-DD");

    Plan
      .find({'city': req.city.id, start_date: {"$lte": sdate}, end_date: {"$gte": sdate}})
      .populate('traveler')
      .sort({ start_date : 1 })
      .exec(function (err, plans) {
        if (req.user) {
          Plan
            .find({'city': req.city.id, end_date: {"$gte": sdate}, traveler: req.user.id})
            .sort({ start_date : 1 })
            .exec(function (err, myPlans) {
              return res.render('cities/traveler', {city: req.city, plans: plans, myPlans: myPlans, start_date: sdate});
            });
        } else {
          return res.render('cities/traveler', {city: req.city, plans: plans, start_date: sdate});
        }
      });
  }
});

module.exports = router;
