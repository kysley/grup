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
  if (this.skipValidation()) {
    return true
  }
  return username.length
}, 'Username cannot be blank');

UserSchema.path('hashedPassword').validate(function(hashedPassword) {
  if (this.skipValidation()) return true;
  return hashedPassword.length && this._password.length;
}, 'Password cannot be blank');

UserSchema.pre('save', function(next) {
  if (!this.isNew) return next();

  if (!validatePresenceOf(this.password) && !this.skipValidation()) {
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
  },

  skipValidation: function () {
    return ~authTypes.indexOf(this.provider);
  }
};


mongoose.model('User', UserSchema);