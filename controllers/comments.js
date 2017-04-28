const utils = require('../lib/utils');

exports.load = (req, res, next, id) => {
  req.comment = req.post.comments
    .find(comment => commend.id == id);

  if (!req.comment) return next(new Error('Comment not found'));
  next();
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