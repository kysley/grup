/**
 * Generic require login routing middlewares
 */

exports.requiresLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
};


/**
 * User authorization routing middleware
 */

exports.user = {
  hasAuthorization: function (req, res, next) {
    if (req.profile.id != req.user.id) {
      return res.redirect('/users'+req.profile.id);
    }
    next();
  }
};


exports.post = {
  hasAuthorization: function (req, res, next) {
    if (req.post.user.id != req.user.id) {
      return res.redirect('/posts'+req.post.id);
    }
    next();
  }
};


/**
 * Comment authorization routing middleware
 */

exports.comment = {
  hasAuthorization: function (req, res, next) {
    // if the current user is comment owner or article owner
    // give them authority to delete
    if (req.user.id === req.comment.user.id || req.user.id === req.article.user.id) {
      next();
    } else {
      req.flash('info', 'You are not authorized');
      res.redirect('/articles/' + req.article.id);
    }
  }
};
