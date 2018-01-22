/**
 * HTTP Endpoints.
 */

const pkg = require('../../package.json');
const express = require('express');
const router = express.Router();

module.exports = (passport) => {

  const api = require('./api')(passport);

  /**
   * Healthcheck endpoint.
   */
  router.get('/ping', (req, res) => {
    res.send();
  });

  /**
   * Versioned API for AWS ALB: /v{major}.{minor}
   */
  const versionParts = pkg.version.match(/\d+/g);
  const version = `v${versionParts[0]}.${versionParts[1]}`;

  router.use(`/${version}/`, api);

  /**
   * API
   */
  router.use('/', api);

  return router;

};
