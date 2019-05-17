var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');
require('dotenv').config();

// route
var index = require('./routes/index');
var auth = require('./routes/auth');
var dashboard = require('./routes/dashboard');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', require('express-ejs-extend'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(session({
  secret: 'mysupercat',
  resave: true,
  saveUninitialized: true,
  // cookie: { maxAge: 10*1000 }
}));
// 驗證是否已經登入
const authCheck = (req, res, next) => {
  console.log('middleware', req.session);
  if (req.session.uid === process.env.ADMIN_UID) {
    return next();
  }
  return res.redirect('/auth/signin');
}
// route
app.use('/', index);
app.use('/auth', auth);
app.use('/dashboard', authCheck, dashboard);// 必須登入才能進入 dashboard

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // next(createError(404));
  var err = new Error('Not Found');
  err.status = 404;
  res.render('error', {
    title: '您所查看的頁面不存在 >"<'
  });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.error(err.stack);
  res.render('error', {
    title: '程式有問題!!'
  });
});

module.exports = app;
