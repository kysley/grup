var async = require('async');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports = (app, passport, auth) => {
  const users = require('../controllers/users');
  app.get('/login', users.login);
  app.get('/signup', users.signup);
  app.get('/logout', users.logout);
  app.post('/users', users.create);
  // app.get('/userslist', users.list);
  app.post('/users/sessions', passport.authenticate('local', {failureRedirect: '/login', failureFlash: 'Invalid username or password'}), users.session);
  app.get('/users/:userId', users.show);

  app.post('/auth/local', passport.authenticate('local', { failureRedirect: '/login'}), users.create);
  // app.get('/auth/local/callback', passport.authenticate('local', { failureRedirect: '/login' }), users.authCallback);

  app.get('/auth/github', passport.authenticate('github', { failureRedirect: '/login' }), users.signin);
  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), users.authCallback);

  /**
   * API related code
   */
  // var apiv1 = require('../controllers/apiv1');
  // app.get('/apiv1/tweets', apiv1.tweetList);
  // app.get('/apiv1/users', apiv1.usersList);

  /**
  * Analytics related code
  */
  var analytics = require('../controllers/analytics');
  app.get('/analytics', analytics.index);

  app.param('userId', users.user);

  //posts routes
  var posts = require('../controllers/posts');
  app.get('/posts', posts.index);
  app.get('/posts/new', auth.requiresLogin, posts.new);
  app.post('/posts', auth.requiresLogin, multipartMiddleware, posts.create);
  app.post('/posts/:id', auth.requiresLogin, auth.post.hasAuthorization, multipartMiddleware, posts.update);
  app.get('/posts/:id', posts.show);
  // app.get('/posts/:id/edit', auth.requiresLogin, auth.post.hasAuthorization, posts.edit);
  app.put('/posts/:id', auth.requiresLogin, auth.post.hasAuthorization, multipartMiddleware, posts.update);
  // app.delete('/posts/:id', auth.requiresLogin, auth.post.hasAuthorization, posts.destroy);
  app.param('id', posts.post);

  //home route
  app.get('/', auth.requiresLogin, posts.index );

  //comment routes
  var comments = require('../controllers/comments');
  app.param('commentId', comments.load);
  app.post('/posts/:id/comments', auth.requiresLogin, comments.create);
  app.get('/posts/:id/comments', auth.requiresLogin, comments.create);
  // app.del('/posts/:id/comments', auth.requiresLogin, comments.destroy);

};