const Mongoose = require('mongoose');
const Post = Mongoose.model('Post');
const User = Mongoose.model('User');
const Analytics = Mongoose.model('Analytics');


function logAnalytics(req)  {
  var url = req.protocol + '://' + req.get('host') + req.originalUrl;
  var analytics = new Analytics(
    {
      ip: req.ip,
      user: req.user,
      url: url
    }
  );
  analytics.save(err => {
    if (err) {
      console.log(err);
    }
  });
}

exports.signin = (req, res) => {};

exports.authCallback = (req, res) => {
  res.redirect('/');
};

exports.login = (req, res) => {
  res.render('users/login', {
    title: 'Login',
    message: req.flash('error')
  });
};

exports.signup = (req, res) => {
  res.render('users/signup', {
    title: 'Sign up',
    user: new User()
  });
};

exports.logout = (req, res) => {
  // logAnalytics(req);
  // req.logout;
  // res.redirect('/login');
  req.session.destroy(function (err) {
    logAnalytics(req)
    res.redirect('/login');
  })
};

exports.session = (req, res) => {
  res.redirect('/');
};

exports.create = (req, res, next) => {
  logAnalytics(req);
  console.log(req.body);
  const user = new User(req.body);
  user.provider = 'local';
  user.save(err => {
    if (err) {
      if (err) req.flash('info', 'Sorry! We are not able to log you in!');
      return res.render('users/signup', {errors: err.errors, user: user});
    }
    req.logIn(user, err => {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  });
};

exports.user = (req, res, next, id) => {
  logAnalytics(req);
  User
    .findOne({_id: id})
    .exec((err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(new Error('failed to load user ' + id));
      }
      req.profile = user;
      next();
    });
};

exports.show = (req, res) => {
  logAnalytics(req);
  var user = req.profile;
  var reqUserId = user._id;
  var userId = reqUserId.toString();

  Post.find({user: userId}, (err, posts) => {
    if (err) {
      return res.render('500');
    }
    res.render('users/show', {
      title: 'Posts from ' + user.name,
      user: user,
      posts: posts,
    });
  });
};