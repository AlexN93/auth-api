/**
 * Retrieve user password and send it via email
 */

module.exports = (service) => {

  return (req, res, next) => {

    service.resetPassword(req.body, (err, data) => {
      if (err) return next(err);

      res.send(data);
    });
  };
};
