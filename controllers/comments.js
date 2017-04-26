const utils = require('../lib/utils');

exports.load = (req, res, next, id) => {
  var post = req.post;
  utils.findByParam(post.comments, {id: id}, (err, comment) => {
    if (err) {
      return next(err);
    }
    req.comment = comment;
    next();
  });
};

// ### Create Comment
exports.create = (req, res) => {
  var post = req.post;
  var user = req.user;

  if (!req.body.body) {
    return res.redirect('/posts/' + post.id);
  }
  post.addComment(user, req.body, err => {
    if (err) {
      return res.render('500');
    }
    res.redirect('/');
  });
};

// // ### Delete Comment
// exports.destroy = (req, res) => {
//   // delete a comment here.
//   var comment = req.comment;
//   comment.remove(err => {
//     if (err) {
//       res.send(400);
//     }
//     res.send(200);
//   });
// };