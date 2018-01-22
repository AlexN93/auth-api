/**
 * Account endpoints.
 */

const express = require('express');
const router = express.Router();


module.exports = (passport) => {

  const getAccount = require('./get-account');

  /**
   * @api {get} /account Get account info
   * @apiName GetAccountInfo
   * @apiGroup Auth
   *
   * @apiHeader {String} Authorization JWT token for authorization.
   * @apiHeaderExample {json} Header-Example:
   *   {
   *     "Authorization": "JWT <accessToken>"
   *   }
   *
   * @apiSuccessExample {json} Success-Response:
   *    HTTP/1.1 200 OK
   *    {
   *      "id": "58fdfa2b4850e3000f8ddb50",
   *      "role": "user",
   *      "created": "2017-07-15T10:33:31.685Z",
   *      "memberships": [{
   *        "id": "1949910641893875",
   *        "provider": "facebook",
   *        "name": "Erich Bachman",
   *        "email": "eric@piedpiper.com"
   *      }]
   *    }
   */
  router.get('/',
    passport.authenticate('access-token', {session: false}),
    getAccount
    );

  return router;
};
