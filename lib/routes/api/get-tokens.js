/**
 * GET tokens.
 */

module.exports = (req, res, next) => {

  res.send({
    userId: req.user._id,
    accessToken: res.locals.accessToken,
    refreshToken: res.locals.refreshToken
  });

};
