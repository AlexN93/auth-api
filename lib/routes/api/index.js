/**
 * HTTP API endpoints.
 */

const express = require('express');
const router = express.Router();

module.exports = (passport) => {

  const accountApi = require('./account')(passport);
  const authenticationResultApi = require('./authentication-result');

  const facebookApi = require('./facebook')(passport);
  const googleApi = require('./google')(passport);
  const linkedinApi = require('./linkedin')(passport);

  const emailApi = require('./email')(passport);

  const signoutApi = require('./signout')(passport);

  const tokenApi = require('./token')(passport);


  // mounting APIs
  router.use('/account', accountApi);
  router.use('/auth', authenticationResultApi);

  router.use('/facebook', facebookApi);
  router.use('/google', googleApi);
  router.use('/linkedin', linkedinApi);

  router.use('/email', emailApi);

  router.use('/signout', signoutApi);

  router.use('/token', tokenApi);

  return router;
};
