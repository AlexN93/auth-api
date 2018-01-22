/**
 * Common localization logic.
 */

module.exports = {

  /**
   * Get user IP Address.
   *
   * @param      {Object}   req   Request.
   * @return     {String}   ip    User's IP Address.
   */
  getIp: function (req) {
    let ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    return ip;
  }

};
