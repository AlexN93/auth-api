/**
 * Token endpoints.
 */

const express = require('express');
const router = express.Router();

const accessToken = require('../../../middleware/access-token.middleware');
const refreshToken = require('../../../middleware/refresh-token.middleware');
const user = require('../../../middleware/user.middleware');

const getTokens = require('../get-tokens');


module.exports = (passport) => {

  /**
   * @api {get} /token/refresh Refresh tokens
   * @apiName RefreshToken
   * @apiGroup Auth
   *
   * @apiHeader {String} Authorization JWT refresh token.
   * @apiHeaderExample {json} Header-Example:
   *   {
   *     "Authorization": "JWT <refreshToken>"
   *   }
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *    {
   *      "accessToken": <token1>,
   *      "refreshToken": <token2>
   *    }
   */
  router.get('/refresh',
    passport.authenticate('refresh-token', {session: false}),
    refreshToken.validate,
    refreshToken.remove,
    refreshToken.create,
    accessToken.create,
    user.update,
    getTokens
  );

  return router;
};
