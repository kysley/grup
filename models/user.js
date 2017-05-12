var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = [''];

var UserSchema = new Schema ({
  username: { type: String },
  hashedPassword: { type: String, default: '' },
  provider: { type: String, default: '' },
  salt: { type: String, default: '' },
  posts: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
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

const validatePresenceOf = value => value && value.length;

UserSchema.path('username').validate(function (username) {
  console.log("checking validation: " + this.skipValidation());
  if (this.skipValidation()) return true;
  return username.length;
}, 'Username cannot be blank');

UserSchema.path('username').validate(function (username, fn) {
  const User = mongoose.model('User');
  if (this.skipValidation()) fn(true);

  // Check only when it is a new user or when email field is modified
  if (this.isNew || this.isModified('username')) {
    User.find({ username: username }).exec(function (err, users) {
      fn(!err && users.length === 0);
    });
  } else fn(true);
}, 'Username is already in use :(');

UserSchema.path('hashedPassword').validate(function(hashedPassword) {
  if (this.skipValidation()) return true;
  return hashedPassword.length && this._password.length;
}, 'Password cannot be blank');

UserSchema.pre('save', function (next) {
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