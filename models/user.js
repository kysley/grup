var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'local'];

var UserSchema = new Schema ({
  username: String,
  hashedPassword: String,
  provider: String,
  salt: String,
  posts: Number,
  comments: Number
});

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

var validatePresenceOf = value => value && value.length;

UserSchema.path('username').validate(function(username) {
  if (authTypes.indexOf(this.provider) !== -1) {
    return true
  }
  return username.length
}, 'username cannot be blank');

UserSchema.path('hashedPassword').validate(function(hashedPassword) {
  if (authTypes.indexOf(this.provider) !== -1) {
    return true
  }
  return hashedPassword.length
}, 'hashedPassword cannot be blank');

UserSchema.pre('save', function(next) {
  if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});

UserSchema.methods = {
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  makeSalt: function() {
    return String(Math.round((new Date().valueOf() * Math.random())));
  },

  encryptPassword: function(password) {
    if (!password) {
      return '';
    }
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
  }
};


mongoose.model('User', UserSchema);