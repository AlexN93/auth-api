/**
 * Access token middleware functionality.
 */

if (!process.env.ACCESS_TOKEN_SECRET) {
  console.log('ACCESS_TOKEN_SECRET environment variable required.');
  process.exit(1);
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_TIMEOUT = +process.env.ACCESS_TOKEN_TIMEOUT || 60 * 60 * 24 * 7;

const jwt = require('jsonwebtoken');

/**
 * Creates access token payload data from user object.
 *
 * @param      {User}    user    User model.
 * @return     {Object}  Access token payload data.
 */
const createAccessTokenPayload = (user) => {
  return {
    userId: user._id,
    role: user.role
  };
};

/**
 * Creates signed access token for a limited time period.
 *
 * @param      {Object}  payload  Access token payload.
 */
const createAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_TIMEOUT});
};


module.exports = {

  /**
   * Creates new access token for authenticated user and saves it to
   * res.locals.acessToken variable.
   *
   * @param      {Object}    req     Request.
   * @param      {Object}    res     Response.
   * @param      {Function}  next    Next middleware callback.
   */
  create: (req, res, next) => {
    const accessTokenPayload = createAccessTokenPayload(req.user);
    const accessToken = createAccessToken(accessTokenPayload);

    res.locals.accessToken = accessToken;

    next();
  }

};
