/**
 * Users business logic layer.
 */

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.log('ADMIN_EMAIL and ADMIN_PASSWORD environment variables required.');
  process.exit(1);
}

const validation = require('../utils/validation');
const debug = require('debug')('auth:users.service');
const randomstring = require("randomstring");
const emailsService = require('./emails.service.js');

const registerAdminUser = (User) => {

  return (fn) => {
    User.createAdmin(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD, (err, admin) => {
      if (err) return fn(err);

      debug(`Admin user ${process.env.ADMIN_EMAIL} created successfully.`);
      fn();
    });
  };

};

const updateEmailPassword = (User) => {

  return (userId, oldPassword, password, fn) => {

    // validate input
    let errors = validation.validatePassword(password);
    if (Object.keys(errors).length > 0) {
      let err = new Error('Password validation failed.');
      err.status = 400;
      err.errors = errors;
      return fn(err);
    }

    User.findOne({_id: userId}, (err, user) => {
      if (err) return fn(err);

      if (!user) {
        let err = new Error(`Could not find user by ${userId}`);
        err.status = 404;
        return fn(err);
      }

      const memberships = user.memberships.filter(m => m.provider === 'email');
      if (!memberships.length) {
        let err = new Error(`User ${userId} does not have email/password pair.`);
        err.status = 403;
        return fn(err);
      }

      const membership = memberships[0];

      // validating old password
      user.validatePassword(oldPassword, membership.password, (err, isValid) => {
        if (err) return fn(err);

        if (!isValid) {
          let err = new Error(`Invalid old password provided for user ${userId}.`);
          err.status = 400;
          return fn(err);
        }

        // updating password
        user.hashPassword(password, (err, hash) => {
          if (err) return fn(err);

          membership.password = hash;

          user.save((err) => {
            if (err) return fn(err);

            fn();
          });
        });
      });
    });

  };

};

const verifyEmailAccount = (User) => {

  return (host, data, fn) => {
    // validate input
    let errors = validation.validateVerificationRequest(data);
    if (Object.keys(errors).length > 0) {
      let err = new Error('Email verification failed.');
      err.status = 400;
      err.errors = errors;
      return fn(err);
    }

    User.findOne({'memberships': {$elemMatch: {emailVerificationToken: data.token}}}, (err, user) => {
      if (err) return fn(err);

      if (!user) {
        let err = new Error(`Could not verify email account`);
        err.status = 400;
        return fn(err);
      }

      const memberships = user.memberships.filter(m => m.provider === 'email');
      let membership = memberships[0];
      membership.isVerified = true;

      user.save((err) => {
        if (err) return fn(err);

        fn(null, {success: true, message: 'Email confirmation completed'});
      });

    });
  };

};

const resetPassword  = (User) => {
  return (data, fn) => {
    if (!data.email) {
      let err = new Error(`Could not verify email account`);
      err.status = 400;
      return fn(err);
    }

    User.findOne({'memberships': {$elemMatch: {email: data.email, provider: 'email'}}}, (err, user) => {
      if (err) return fn(err);

      if (!user) {
        let err = new Error(`Could not find user by email`);
        err.status = 404;
        return fn(err);
      }

      const memberships = user.memberships.filter(m => m.provider === 'email');
      let membership = memberships[0];
      if (!membership.email || membership.email.trim() === '') {
        let err = new Error('User does not have existing email.');
        err.status = 404;
        err.errors = [{email: 'user email not found'}];
        return fn(err);
      }

      let password = randomstring.generate(8);

      user.hashPassword(password, (err, hash) => {
        if (err) return fn(err);

        membership.password = hash;

        emailsService.sendNewPasswordEmail(membership.email, password, (err, res) => {
          if (err) return fn(err);

          user.save((err) => {
            if (err) return fn(err);

            fn(null);
          });
        });
      });


    });


  };
};

module.exports = (models) => {

  const User = models.User;

  return {

    /**
     * Creates default admin user.
     */
    registerAdminUser: registerAdminUser(User),

    /**
     * Updates email password.
     */
    updateEmailPassword: updateEmailPassword(User),

    /**
     * Verify user email account.
     */
    verifyEmailAccount: verifyEmailAccount(User),

    /**
     * Retrieve user password.
     */
    resetPassword: resetPassword(User),

  };

};
