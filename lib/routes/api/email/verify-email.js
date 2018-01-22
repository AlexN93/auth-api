/**
 * Verify email account
 */

module.exports = (service) => {

  return (req, res, next) => {

    service.verifyEmailAccount(`${req.protocol}://${req.get('host')}`, req.query, (err, data) => {
      if (err) return res.redirect('/email-confirmation/failure.html');

      res.redirect('/email-confirmation/success.html');
    });
  };
};
