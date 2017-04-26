var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var utils = require('../lib/utils');


var getTags = tags => tags.join(',');
var setTags = tags => tags.slit(',');

var PostSchema = new Schema({
  title: {type: String, default: '', trim: true},
  body: {type: String, default: '', trim: true},
  user: {type: Schema.ObjectId, ref: 'User'},
  comments: [{
    body: {type: String, default: ''},
    user: {type: Schema.ObjectId, ref: 'User'},
    commenterName: {type: String, default: ''},
    createdAt: {type: Date, default: Date.now}
  }],
  tags: {type: [], get: getTags, set: setTags},
  createdAt: {type: Date, default: Date.now}
});

// Pre save hook
// PostSchema.pre('save', function(next) {
//   if (this.favorites) {
//     this.favoritesCount = this.favorites.length;
//   }
//   if (this.favorites) {
//     this.favoriters = this.favorites;
//   }
//   next();
// });

PostSchema.path('title').validate(title => title.length > 0, 'Post title cannot be blank');

PostSchema.methods = {
  uploadAndSave: function(images, cb) {
    if (!images || !images.length) {
      return this.save(cb);
    }
    var imager = new Imager(imagerConfig, 'S3');
    var self = this;

    imager.upload(images, (err, cdnUri, files) => {
      if (err) {
        return cb(err);
      }
      if (files.length) {
        self.image = {cdnUri: cdnUri, files: files};
      }
      self.save(cb);
    }, 'article');
  },
  addComment: function(user, comment, cb) {
    if (user.name) {
      this.comments.push({
        body: comment.body,
        user: user._id,
        commenterName: user.name
      });
      this.save(cb);
    } else {
      this.comments.push({
        body: comment.body,
        user: user._id,
        commenterName: user.username
      });
      this.save(cb);
    }
  },
};

PostSchema.statics = {
  // Load posts
  load: function(id, cb) {
    this.findOne({_id: id})
      .populate('user', 'name username provider github facebook twitter')
      .populate('comments.user')
      .exec(cb);
  },
  // List posts
  list: function(options, cb) {
    var criteria = options.criteria || {};
    this.find(criteria)
      .populate('user', 'name username provider github facebook twitter')
      .sort({'createdAt': -1})
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  },
  // List posts
  limitedList: function(options, cb) {
    var criteria = options.criteria || {};
    this.find(criteria)
      .populate('user', 'name username')
      .sort({'createdAt': -1})
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  },
  // posts of User
  userPosts: function(id, cb) {
    this.find({"user": ObjectId(id)})
        .toArray()
        .exec(cb);
  },
};

mongoose.model('Post', PostSchema);