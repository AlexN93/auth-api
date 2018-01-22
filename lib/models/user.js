/**
 * User model.
 */

const moment = require('moment');
const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');

// Schema
const Schema = mongoose.Schema;

const userSchema = new Schema({
  role: String,
  refreshTokens: [String],
  memberships: [new Schema({
    id: String,
    provider: String,
    token: String,
    name: String,
    email: String,
    password: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String
  }, {_id: false})],
  created: {type: Date, default: moment.utc}
}, { collection: 'users' });

// Indexes
userSchema.index({ created: 1});
userSchema.index({ 'memberships.provider': 1, 'memberships.email': 1 });

// Helper functions

const hashPassword = (password, fn) => {
  bcrypt.genSalt(8, (err, salt) => {
    bcrypt.hash(password, salt, null, fn);
  });
};



// Methods

userSchema.methods.hashPassword = hashPassword;

userSchema.methods.validatePassword = (password, passwordHash, fn) => {
  bcrypt.compare(password, passwordHash, fn);
};


// Static methods

/**
 * Creates or updates admin account.
 *
 * @param      {string}    email     Admin email.
 * @param      {string}    password  Admin password.
 * @param      {Function}  fn        Callback.
 */
userSchema.statics.createAdmin = function (email, password, fn) {
  hashPassword(password, (err, hash) => {
    this.findOneAndUpdate(
      {
        role: 'admin'
      },
      {
        role: 'admin',
        memberships: [{
          id: email,
          provider: 'email',
          email: email,
          password: hash
        }]
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }, (err, admin) => {
        fn(err, admin);
      });
  });
};


module.exports = mongoose.model('User', userSchema);
