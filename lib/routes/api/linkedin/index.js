/**
 * LinkedIn endpoints.
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
   * @api {get} /linkedin LinkedIn web authentication
   * @apiName LoginLinkedIn
   * @apiGroup Auth
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 302 Found
   *    Location: /linkedin/callback
   */
  router.get('/',
    passport.authenticate('linkedin', {
      failureRedirect: '/auth/failure',
      scope: ['r_emailaddress']
    })
  );

  /**
   * @api {get} /linkedin/callback LinkedIn web authentication callback
   * @apiName LoginLinkedInCallback
   * @apiGroup Auth
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 302 Found
   *    Location: /auth/success
   */
  router.get('/callback',
    passport.authenticate('linkedin', {session: false}),
    refreshToken.create,
    accessToken.create,
    user.update,
    sns.publishSignupMessage,
    redirectAuthSuccess
  );

  /**
   * @api {post} /linkedin/token LinkedIn token authentication (mobile apps)
   * @apiName LoginLinkedInToken
   * @apiGroup Auth
   *
   * @apiParam {String} access_token Access token received from LinkedIn.
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
    passport.authenticate('linkedin-token', {session: false}),
    refreshToken.create,
    accessToken.create,
    user.update,
    sns.publishSignupMessage,
    getTokens
  );

  return router;
};
