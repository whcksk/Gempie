var express = require('express');
var router = express.Router();
var GooglePlaces = require('node-googleplaces');

var User = require("../models/user");
var City = require("../models/city");
var Plan = require("../models/plan");

var places = new GooglePlaces('AIzaSyAnhXCqLbWgRR84ciGzGJ4z9wL-MQsPBok');

router.param('username', function (req, res, next, username) {
  //console.log('CALLED ONLY ONCE with', username);
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
          res.redirect('/traveler/' + req.user.username);
        }
      });
});

router.post('/:username', function(req, res, next){
  var city_id = req.body.city_id;

  City.findById(city_id, function(err, city){
    if (!err) {
      if (city) {
        var newPlan = new Plan({city: city_id, traveler: req.traveler.id,
          start_date: req.body.start_date, end_date: req.body.end_date, content: req.body.content });

        newPlan.save(function(err){
          if (err) {
            req.flash('error', 'error in newPlan.save');
            return res.redirect('/travelers/' + req.user.username);
          }
          else {
            return res.redirect("/travelers/" + req.user.username);
          }
        });

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

              var newCity = new City({_id: place.place_id, name: place.name, country: country});

              newCity.save(function (err) {
                if (err){
                  req.flash('error', 'error in newCity.save');
                  return res.redirect('/travelers/' + req.user.username);
                }
              });

              newPlan = new Plan({city: city_id, traveler: req.traveler.id,
                start_date: req.body.start_date, end_date: req.body.end_date, content: req.body.content });

              newPlan.save(function(err){
                if (err) {
                  req.flash('error', 'error in newPlan.save');
                  return res.redirect('/travelers/' + req.user.username);
                }
                else {
                  return res.redirect("/travelers/" + req.user.username);
                }
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

module.exports = router;
