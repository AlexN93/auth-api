/**
 * Barrel file for db models.
 */


// env
if (!process.env.MONGODB_CONNECTION) {
  console.log('MONGODB_CONNECTION environment variable required.');
  process.exit(1);
}

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_CONNECTION);

exports.User = require('./user');
