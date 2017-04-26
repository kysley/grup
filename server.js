var express = require('express');
var app = express();
// var assets = require('./assets');
var fs = require('fs');
var passport = require('passport');
require('dotenv').config();

const config = require('./config/config');
const auth = require('./config/middlewares/authorization');
const mongoose = require('mongoose');

mongoose.connect(config.db);

const models_path = __dirname+'/models';
fs.readdirSync(models_path).forEach(file => {
  require(models_path+'/'+file);
});

require('./config/passport')(passport, config);
require('./config/express')(app, config, passport);
require('./config/routes')(app, passport, auth);
const port = process.env.PORT || 3000;

app.listen(port);
console.log('Express app started on port '+port);
exports = module.exports = app;