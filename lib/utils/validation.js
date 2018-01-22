/**
 * Common validation logic.
 */

module.exports = {

  /**
   * Validates email string.
   *
   * @param      {String}   email   Email.
   * @return     {boolean}  True if the data is correct.
   */
  validateEmail: function (email) {
    var errors = {};

    if (!/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
      errors['email'] = 'email field is invalid';
    }

    return errors;
  },

  /**
   * Validates password.
   *
   * @param      {String}   password   Password.
   * @return     {boolean}  True if the data is correct.
   */
  validatePassword: function (password) {
    var errors = {};

    if (!password || password.trim() === '' || password.length < 6 ) {
      errors['password'] = 'password field required and should be at least 6 character long';
    }

    return errors;
  },

  /**
   * Validates request for email verification.
   *
   * @param      {String}   data   Params.
   * @return     {boolean}  True if the data is correct.
   */
  validateVerificationRequest: function (data) {
    var errors = {};

    if (!data.token || data.token.trim() === '') {
      errors['token'] = 'token field required or is not valid';
    }

    return errors;
  }

};
