var path = require('path');
var rootPath = path.normalize(__dirname+ '/..');

module.exports = {
  db: process.env.DATABASE_URI,
  root: rootPath,
  app: {
    name: process.env.APP_NAME
  },
  // github: {
  //   clientID: process.env.CLIENT_ID,
  //   clientSecret: process.env.CLIENT_SECRET,
  //   callbackURL: 'http://localhost:3000/auth/github/callback'
  // }
};