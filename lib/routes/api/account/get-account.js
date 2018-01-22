/**
 * GET account info.
 */

const mapMembership = (membership) => {
  return {
    id: membership.id,
    provider: membership.provider,
    email: membership.email,
    name: membership.name
  };
}

const mapUser = (user) => {
  return {
    id: user._id,
    role: user.role,
    created: user.created,
    memberships: user.memberships.map(mapMembership)
  };
};

module.exports = (req, res, next) => {

  res.send(mapUser(req.user));

};
