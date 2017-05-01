var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var flash = require('connect-flash');
var mongoose = require('mongoose');
var passport = require('passport');
//var LocalStrategy = require('passport-local').Strategy;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017');
//mongoose.connect('mongodb://dbuser:dbpassword@ds050869.mlab.com:50869/project');
var db = mongoose.connection;

// Import Routes
var index = require('./routes/index');
var travelers = require('./routes/travelers');
var auth = require('./routes/auth');
var cities = require('./routes/cities');
var user = require('./routes/user');
var pages = require('./routes/pages');

var app = express();

var store = new MongoDBStore({
  uri: 'mongodb://localhost:27017', // New Database
  //uri: 'mongodb://dbuser:dbpassword@ds050869.mlab.com:50869/project', // Old Database
  collection: 'sessions'
});

var chatAPI = require('./config/chat');
chatAPI(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));

// Express Session
app.use(session({
	secret:'aasdfvqqegfadsfaafqwe',
	store: store,
	saveUninitialized: true,
	resave: false,
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Moment.js
var moment = require('moment');
moment.locale('ko');
app.locals.moment = moment;

// Flash Messages
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

var loginRequired = require("./config/auth").loginRequired;

app.use('/', index);
app.use('/user', loginRequired(), user);
app.use('/auth', auth);
app.use('/cities', cities);
app.use('/travelers', travelers);
app.use('/pages', pages);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
