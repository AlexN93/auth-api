/**
 * Google endpoints.
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
   * @api {get} /google Google+ web authentication
   * @apiName LoginGoogle
   * @apiGroup Auth
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 302 Found
   *    Location: /google/callback
   */
  router.get('/',
    passport.authenticate('google', {
      failureRedirect: '/auth/failure',
      scope: ['email']
    })
  );

  /**
   * @api {get} /google/callback Google+ web authentication callback
   * @apiName LoginGoogleCallback
   * @apiGroup Auth
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 302 Found
   *    Location: /auth/success
   */
  router.get('/callback',
    passport.authenticate('google', {session: false}),
    refreshToken.create,
    accessToken.create,
    user.update,
    sns.publishSignupMessage,
    redirectAuthSuccess
  );

  /**
   * @api {post} /google/token Google token authentication (mobile apps)
   * @apiName LoginGoogleToken
   * @apiGroup Auth
   *
   * @apiParam {String} access_token Access token received from Google.
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
    passport.authenticate('google-token', {session: false}),
    refreshToken.create,
    accessToken.create,
    user.update,
    sns.publishSignupMessage,
    getTokens
  );

  return router;
};
