/**
 * Facebook endpoints.
 */

const express = require('express');
const router = express.Router();

const accessToken = require('../../../middleware/access-token.middleware');
const refreshToken = require('../../../middleware/refresh-token.middleware');
const user = require('../../../middleware/user.middleware');
const sns = require('../../../middleware/sns.middleware');


module.exports = (passport) => {

  const redirectAuthSuccess = require('../redirect-auth-success');
  const getTokens = require('../get-tokens');

  /**
   * @api {get} /facebook Facebook web authentication
   * @apiName LoginFacebook
   * @apiGroup Auth
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 302 Found
   *    Location: /facebook/callback
   */
  router.get('/',
    passport.authenticate('facebook', {
      failureRedirect: '/auth/failure',
      scope: ['email']
    })
  );

  /**
   * @api {get} /facebook/callback Facebook web authentication callback
   * @apiName LoginFacebookCallback
   * @apiGroup Auth
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 302 Found
   *    Location: /auth/success
   */
  router.get('/callback',
    passport.authenticate('facebook', {session: false}),
    refreshToken.create,
    accessToken.create,
    user.update,
    sns.publishSignupMessage,
    redirectAuthSuccess
  );

  /**
   * @api {post} /facebook/token Facebook token authentication (mobile apps)
   * @apiName LoginFacebookToken
   * @apiGroup Auth
   *
   * @apiParam {String} access_token Access token received from Facebook.
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *    {
   *      "userId": <userId>,
   *      "accessToken": <token1>,
   *      "refreshToken": <token2>
   *    }
   */
  router.post('/token',
    passport.authenticate('facebook-token', {session: false}),
    refreshToken.create,
    accessToken.create,
    user.update,
    sns.publishSignupMessage,
    getTokens
  );

  return router;
};
