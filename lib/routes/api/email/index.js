/**
 * Email authentication endpoints.
 */

const express = require('express');
const router = express.Router();

const accessToken = require('../../../middleware/access-token.middleware');
const refreshToken = require('../../../middleware/refresh-token.middleware');
const user = require('../../../middleware/user.middleware');
const sns = require('../../../middleware/sns.middleware');

const getTokens = require('../get-tokens');

const models = require('../../../models');
const service = require('../../../services/users.service')(models);
const verifyEmailAccount = require('./verify-email')(service);
const resetPassword = require('./reset-password')(service);


module.exports = (passport) => {

  /**
   * @api {post} /email/signup Email registration
   * @apiName EmailSignup
   * @apiGroup Auth
   *
   * @apiParam {String} email Email address.
   * @apiParam {String} password Password.
   * @apiParam {String} [username] Username.
   * @apiParam {String} [fullName] Full name.
   * @apiParam {String} [phoneNumber] Phone number.
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *    {
   *      "userId": <userId>,
   *      "accessToken": <token1>,
   *      "refreshToken": <token2>
   *    }
   */
  router.post('/signup',
    passport.authenticate('local-signup', {session: false}),
    refreshToken.create,
    accessToken.create,
    user.update,
    sns.publishSignupMessage,
    (req, res, next) => { res.end(); }
  );

  /**
   * @api {post} /email/signin Email login
   * @apiName EmailSignin
   * @apiGroup Auth
   *
   * @apiParam {String} email Email address.
   * @apiParam {String} password Password.
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *    {
   *      "userId": <userId>,
   *      "accessToken": <token1>,
   *      "refreshToken": <token2>
   *    }
   */
  router.post('/signin',
    passport.authenticate('local-signin', {session: false}),
    refreshToken.create,
    accessToken.create,
    user.update,
    getTokens
  );

  /**
   * @api {put} /email/change-password Change password
   * @apiName EmailChangePassword
   * @apiGroup Auth
   *
   * @apiHeader {String} Authorization JWT token for authorization.
   * @apiHeaderExample {json} Header-Example:
   *   {
   *     "Authorization": "JWT <accessToken>"
   *   }
   *
   * @apiParam {String} oldPassword Password.
   * @apiParam {String} password Password.
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   */
  router.put('/change-password',
    passport.authenticate('access-token', {session: false}),
    user.changePassword
  );

  /**
   * @api {get} /email/verification Verify email account
   * @apiName VerifyEmail
   * @apiGroup Auth
   *
   */
  router.get('/verification',
    verifyEmailAccount
  );

  router.put('/retrieve-password',
    resetPassword
  );

  /**
   * @api {put} /email/reset-password Sends user new password
   * @apiName EmailResetPassword
   * @apiGroup Auth
   *
   * @apiParam {String} email User email.
   */
  router.put('/reset-password',
    resetPassword
  );

  return router;
};
