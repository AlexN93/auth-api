/**
 * SNS publishing middleware functionality.
 */

const snsService = require('../services/sns.service');
const localization = require('../utils/localization');

module.exports = {

  /**
   * Publishes signup message.
   *
   * @param      {Object}    req     Request.
   * @param      {Object}    res     Response.
   * @param      {Function}  next    Next middleware callback.
   */
  publishSignupMessage: (req, res, next) => {

    const user = req.user;
    const profile = req.profile;

    if (profile.provider === 'email') {
      profile.emailVerificationUrl = `${req.protocol}://${req.get('host')}/email/verification?token=${profile.emailVerificationToken}`;
      profile.username = req.body.username;
      profile.fullName = req.body.fullName;
      profile.phoneNumber = req.body.phoneNumber;
    }

    if (!profile.isNewUser) {
      // do not publish signup for existing users
      return next();
    }

    profile.ipAddress = localization.getIp(req);
    const message = {
      userId: user._id,
      profile: profile
    };

    snsService.publishSignupMessage(message, (err) => {
      if (err) return next(err);
      next();
    });

  }

};
