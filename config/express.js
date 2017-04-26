/**
 * Module dependencies
 */

var express        = require('express');
var session        = require('express-session');
var flash          = require('express-flash');
var compress       = require('compression');
var favicon        = require('serve-favicon');
var mongoStore     = require('connect-mongo')(session);
var helpers        = require('view-helpers');
var morgan         = require('morgan');
var cookieParser   = require('cookie-parser');
var bodyParser     = require('body-parser');
var connect        = require('connect');
var methodOverride = require('method-override');
var sassMiddleware = require('node-sass-middleware');
var path           = require('path');
// var assets         = require('../assets');

module.exports = (app, config, passport) => {
  app.set('showStackError', true);

  app.use(compress({
    filter: function(req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
    },
    level: 9
  }));

  app.use(sassMiddleware({
    src: config.root + '/sass',
    dest: config.root + '/public/css',
    prefix: '/css',
    debug: true,
  }));

  app.use(express.static(path.join(config.root, 'public')));

  app.use(morgan('dev'));

  app.set('views', config.root + '/views');
  app.set('view engine', 'pug');

  app.use(helpers(config.app.name));
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  }));
  app.use(session({
    secret: process.env.SECRET,
    store: new mongoStore({
      url: config.db,
      collection: 'sessions'
    }),
    resave: true,
    saveUninitialized: true
  }));

  // app.use("/img", assets); // makes the image assets accessible via relative URL
  app.use(passport.initialize());
  app.use(passport.session({secret: process.env.SECRET, resave: true, saveUninitialized: true}));
  app.use(flash());
  app.use((err, req, res, next) => {
    if (err.message.indexOf('not found') !== -1) {
      return next();
    }
    console.log(err.stack);

    res.status(500).render('500', {error: err.stack});
  });

  /*app.use((req, res) => {
    res.status(404).render('404', {
      url: req.originalUrl, error: 'Not found'
    });
  });*/
};