/**
 * Refresh token middleware functionality.
 */

if (!process.env.REFRESH_TOKEN_SECRET) {
  console.log('REFRESH_TOKEN_SECRET environment variable required.');
  process.exit(1);
}

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_TIMEOUT = +process.env.REFRESH_TOKEN_TIMEOUT || 60 * 60 * 24 * 30;

const MAX_AUTH_SESSIONS = 5;

const jwt = require('jsonwebtoken');
const uuid = require('uuid');

/**
 * Creates refresh token payload data.
 *
 * @param      {Object}  user    User object.
 */
const createRefreshTokenPayload = (user) => {
  return {
    userId: user._id,
    token: uuid.v4()
  };
};

/**
 * Creates signed refresh token for a limited time period.
 *
 * @param      {Object}  payload  Token payload data.
 */
const createRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {expiresIn: REFRESH_TOKEN_TIMEOUT});
};


module.exports = {

  /**
   * Creates new refresh token for authenticated user and saves it to
   * res.locals.refreshToken variable.
   *
   * @param      {Object}    req     Request.
   * @param      {Object}    res     Response.
   * @param      {Function}  next    Next middleware callback.
   */
  create: (req, res, next) => {

    const user = req.user;

    // create token payload
    const refreshPayload = createRefreshTokenPayload(user);

    user.refreshTokens = user.refreshTokens || [];

    // delete old tokens if the number of sessions is too big
    if (user.refreshTokens.length >= MAX_AUTH_SESSIONS) {
        user.refreshTokens.shift();
    }

    // add new token
    user.refreshTokens.push(refreshPayload.token);

    // pass token to next middleware
    res.locals.refreshToken = createRefreshToken(refreshPayload);

    next();

  },

  /**
   * Validates refresh token.
   *
   * @param      {Object}    req     Request.
   * @param      {Object}    res     Response.
   * @param      {Function}  next    Next callback.
   */
  validate: (req, res, next) => {

    const exists = req.user.refreshTokens.filter(t => t == req.token).length > 0;
    if (exists) {
      return next();
    }

    const err = new Error('Unexisting refresh token provided');
    err.status = 403;

    next(err);

  },

  /**
   * Removes token from user collection of tokens for current user.
   *
   * @param      {Object}    req     Request.
   * @param      {Object}    res     Response.
   * @param      {Function}  next    Next callback.
   */
  remove: (req, res, next) => {

    const user = req.user;
    user.refreshTokens = user.refreshTokens || [];

    // remove token
    const tokenIndex = user.refreshTokens.indexOf(req.token);
    if (tokenIndex >= 0) {
      user.refreshTokens.splice(tokenIndex, 1);
    }

    next();
  },

  /**
   * Removes all tokens for current user.
   *
   * @param      {Object}    req     Request.
   * @param      {Object}    res     Response.
   * @param      {Function}  next    Next callback.
   */
  removeAll: (req, res, next) => {

    const user = req.user;
    user.refreshTokens = [];

    next();
  }

};
