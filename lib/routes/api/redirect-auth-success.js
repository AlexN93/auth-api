/**
 * Redirect to authentication success.
 */

module.exports = (req, res, next) => {

  const authSuccessUrl = '/auth/success';
  const redirectUri = `${authSuccessUrl}?access_token=${res.locals.accessToken}&refresh_token=${res.locals.refreshToken}`;

  res.redirect(301, redirectUri);

};
