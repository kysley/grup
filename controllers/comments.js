const utils = require('../lib/utils');
const { wrap: async } = require('co');

exports.load = (req, res, next, id) => {
  req.comment = req.post.comments
    .find(comment => comment.id == id);

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

// ### Delete Comment
exports.destroy = async(function* (req, res) {
  yield req.post.removeComment(req.params.commentId);
  req.flash('info', 'Removed comment');
  res.redirect('/posts/' + req.post.id);
  respondOrRedirect({ req, res }, `/posts/${req.post.id}`, {}, {
    type: 'info',
    text: 'Removed comment'
  });
});
