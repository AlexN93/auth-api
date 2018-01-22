/**
 * User middleware.
 */

const models = require('../models');
const service = require('../services/users.service')(models);

module.exports = {

  /**
   * Saves or updates user data according to provided req.user object.
   *
   * @param      {Object}    req     Request.
   * @param      {Object}    res     Response.
   * @param      {Function}  next    Next middleware callback.
   */
  update: (req, res, next) => {

    req.user.save((err) => {
      if (err) return next(err);

      next();
    });

  },

  /**
   * Updates user password.
   *
   * @param      {Object}    req     Request.
   * @param      {Object}    res     Response.
   * @param      {Function}  next    Next middleware callback.
   */
  changePassword: (req, res, next) => {

    const {oldPassword, password} = req.body;

    service.updateEmailPassword(req.user._id, oldPassword, password, (err) => {
      if (err) return next(err);

      res.send();
    });

  }

};
