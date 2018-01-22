/**
 * Signout endpoints.
 */

const express = require('express');
const router = express.Router();

const accessToken = require('../../../middleware/access-token.middleware');
const refreshToken = require('../../../middleware/refresh-token.middleware');
const user = require('../../../middleware/user.middleware');

module.exports = (passport) => {

  /**
   * @api {delete} /signout Logout
   * @apiName Signout
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
   */
  router.delete('/',
    passport.authenticate('refresh-token', {session: false}),
    refreshToken.remove,
    user.update,
    (req, res, next) => {
      res.send();
    }
  );

  /**
   * @api {delete} /signout/all Logout from all devices
   * @apiName SignoutAll
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
   */
  router.delete('/all',
    passport.authenticate('refresh-token', {session: false}),
    refreshToken.removeAll,
    user.update,
    (req, res, next) => {
      res.send();
    }
  );

  return router;
};
