/**
 * Default errors.
 */

const debug = require('debug')('auth:error');

exports.notfound = (req, res) => {
  res.status(404).send({ message: 'Resource not found' });
};

exports.error = (err, req, res, next) => {

  // setting status
  res.status(err.status || 500);

  if (res.statusCode === 500) {

    // logging stack trace
    debug(err.message);
    debug(err.stack);

    res.send({ message: 'Internal Server Error' });
  } else {
    res.send({ message: err.message, errors: err.errors });
  }

};
