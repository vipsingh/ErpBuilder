var express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  _ = require("lodash"),
  session = require('express-session'),
  chalk = require('chalk'),
  PrettyError = require('pretty-error'),
  createNamespace = require('continuation-local-storage').createNamespace;
require('app-module-path').addPath(__dirname);
global.__topDirName = path.join(__dirname, '');

var perror = new PrettyError();
var StackApp = require('./fm/stackApp');
var app_init = require('./fm/init');
var app = express();

var stackApp = new StackApp.App();
stackApp.init().then(function (d) {
    console.log(chalk.white.bgGreen('<<Init Completed>>'));
    StackApp.setDefault(stackApp);
}).catch(function (err) {
    console.error(perror.render(err));
    process.exit(0);
});

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

app_init.init();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var session_config = {
  secret: 'stackapp',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies//for https
}
var ctx_store = createNamespace('contextspace');
app.use(session(session_config));

app.use(function (req, res, next) {
  ctx_store.run(function () {
      ctx_store.set('session', req.session);
      next();
  });
});

//Routes
app.use('/', require('./routes/index'));
//API
var sys_api = require('./api');
Object.keys(sys_api).forEach((a_api)=>{
    app.use('/api/' + a_api, sys_api[a_api]);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {}
    });
});


module.exports = app;
