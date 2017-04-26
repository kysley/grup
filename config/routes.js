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
  app.post('/users/sessions', passport.authenticate('local', {failureRedirect: '/login', failureFlash: 'Invalid email or password'}), users.session);
  app.get('/users/:userId', users.show);
  // app.get('/users/:userId/followers', users.showFollowers);
  // app.get('/users/:userId/following', users.showFollowing);

  app.post('/auth/local', passport.authenticate('local', { failureRedirect: '/login'}), users.create);
  // app.get('/auth/local/callback', passport.authenticate('local', { failureRedirect: '/login' }), users.authCallback);

  // app.get('/auth/facebook', passport.authenticate('facebook',{scope: ['email', 'user_about_me'], failureRedirect: '/login' }), users.signin);
  // app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), users.authCallback);
  app.get('/auth/github', passport.authenticate('github', { failureRedirect: '/login' }), users.signin);
  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), users.authCallback);
  // app.get('/auth/twitter', passport.authenticate('twitter', { failureRedirect: '/login' }), users.signin);
  // app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }));

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
  app.post('/posts/:id/comments', auth.requiresLogin, comments.create);
  app.get('/posts/:id/comments', auth.requiresLogin, comments.create);
  // app.del('/posts/:id/comments', auth.requiresLogin, comments.destroy);

  /**
   * Favorite routes
   */
   // const favorites = require('../controllers/favorites');

   // app.post('/tweets/:id/favorites', auth.requiresLogin, favorites.create);
   // app.del('/tweets/:id/favorites', auth.requiresLogin, favorites.destroy);
   // app.post('/users/tweets/:id/favorites', auth.requiresLogin, favorites.create);
   // app.del('/users/tweets/:id/favorites', auth.requiresLogin, favorites.destroy);

   // /**
   //  * Follow
   //  */
   // const follows = require('../controllers/follows');

   // app.post('/users/:userId/follow', auth.requiresLogin, follows.follow);
};