/**
 * Authentication result endpoints.
 */

const express = require('express');
const router = express.Router();

router.get('/success', (req, res, next) => {
  res.send({ authentication: "success" });
});

router.get('/failure', (req, res, next) => {
  res.send({ authentication: "failure" });
});

module.exports = router;
