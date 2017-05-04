function simpleStringify (object){
    var simpleObject = {};
    for (var prop in object ){
        if (!object.hasOwnProperty(prop)){
            continue;
        }
        if (typeof(object[prop]) == 'object'){
            continue;
        }
        if (typeof(object[prop]) == 'function'){
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
}

const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const Analytics = mongoose.model('Analytics');
const _ = require('underscore');

function logAnalytics(req) {
  var url = req.protocol + '://' + req.get('host') + req.originalUrl;
  var crudeIpArray = req.ip.split(':');
  var ipArrayLength = crudeIpArray.length;
  // cleanup IP to remove unwanted characters
  var cleanIp = crudeIpArray[ipArrayLength - 1];
  if (req.get('host').split(':')[0] !== 'localhost') {
    var analytics = new Analytics(
      {
        ip: cleanIp,
        user: req.user,
        url: url
      });
    analytics.save(err => {
      if (err) {
        console.log(err);
      }
    });
  }
}

exports.post = (req, res, next, id) => {
  logAnalytics(req);
  Post.load(id, (err, post) => {
    if (err) {
      return next(err);
    }
    if (!post) {
      return next(new Error('Failed to load post' + id));
    }
    req.post = post;
    next();
  });
};

exports.new = (req, res) => {
  logAnalytics(req);
  res.render('posts/new', {
    title: 'New Post',
    post: new Post({})
  });
};

exports.create = (req, res) => {
  logAnalytics(req);
  var post = new Post(req.body);
  post.user = req.user;
  post.uploadAndSave(req.file, err => {
    if (err) {
      res.render('posts/new', {
        title: 'New Post',
        post: post,
        error: err.errors
      });
    } else {
      res.redirect('/');
    }
  });
};

// exports.edit = (req, res) => {
//   logAnalytics(req);
//   res.render('posts/edit', {
//     title: 'Edit' + req.post.title,
//     post: req.post
//   });
// };

exports.show = (req, res) => {
  logAnalytics(req);
  res.render('posts/show', {
    title: req.post.title,
    post: req.post
  });
};

exports.update = (req, res) => {
  logAnalytics(req);
  var post = req.post;
  post = _.extend(post, req.body);
  post.uploadAndSave(req.files.image, err => {
    if (err) {
      res.render('posts/edit', {
        title: 'Edit Post',
        post: post,
        error: err.errors
      });
    } else {
      res.redirect('/');
    }
  });
};

exports.destroy = (req, res) => {
  logAnalytics(req);
  // var post = req.post;
  req.post.remove(err => {
    if (err) {
      return res.render('500');
    }
    res.redirect('/');
  });
};

// exports.index = (req, res) => {
//   logAnalytics(req);
//   var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
//   var perPage = 15;
//   var options = {
//     perPage: perPage,
//     page: page
//   };

//   Tweet.list(options, (err, tweets) => {
//     if (err) {
//       return res.render('500');
//     }
//     Tweet.count().exec((err, count) => {
//       if (err) {
//         return res.render('500');
//       }
//       let followingCount = req.user.following.length;
//       let followerCount = req.user.followers.length;
//       Analytics.list({perPage: 15}, (err, analytics) => {
//         if (err) {
//           res.render('500');
//         }
//         res.render('tweets/index', {
//           title: 'List of Tweets',
//           tweets: tweets,
//           analytics: analytics,
//           page: page + 1,
//           pages: Math.ceil(count / perPage),
//           followerCount: followerCount,
//           followingCount: followingCount
//         });
//       });
//     });
//   });
// };

exports.index = (req, res) => {
  logAnalytics(req);
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var perPage = 15;
  var options = {
    perPage: perPage,
    page: page
  };

  Post.list(options, (err, posts) => {
    if (err) {
      return res.render('500');
    }
    Post.count().exec((err, count) => {
      if (err) {
        return res.render('500');
      }
      // let followingCount = req.user.following.length;
      // let followerCount = req.user.followers.length;
      Analytics.list({perPage: 15}, (err, analytics) => {
        if (err) {
          res.render('500');
        }
        res.render('posts/index', {
          title: 'List of posts',
          posts: posts,
          analytics: analytics,
          page: page + 1,
          pages: Math.ceil(count / perPage),
          // followerCount: followerCount,
          // followingCount: followingCount
        });
      });
    });
  });
};