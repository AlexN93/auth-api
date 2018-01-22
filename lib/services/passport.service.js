/**
 * Passport service business logic layer.
 */

// env
if (!process.env.ACCESS_TOKEN_SECRET) {
  console.log('ACCESS_TOKEN_SECRET environment variable required.');
  process.exit(1);
}

if (!process.env.REFRESH_TOKEN_SECRET) {
  console.log('REFRESH_TOKEN_SECRET environment variable required.');
  process.exit(1);
}

if (!process.env.FACEBOOK_CLIENTID || !process.env.FACEBOOK_CLIENTSECRET) {
  console.log('FACEBOOK_CLIENTID and FACEBOOK_CLIENTSECRET environment variables required.');
  process.exit(1);
}

if (!process.env.GOOGLE_CLIENTID || !process.env.GOOGLE_CLIENTSECRET) {
  console.log('GOOGLE_CLIENTID and GOOGLE_CLIENTSECRET environment variables required.');
  process.exit(1);
}

if (!process.env.LINKEDIN_CLIENTID || !process.env.LINKEDIN_CLIENTSECRET) {
  console.log('LINKEDIN_CLIENTID and LINKEDIN_CLIENTSECRET environment variables required.');
  process.exit(1);
}

const validation = require('../utils/validation');
const debug = require('debug')('auth:passport.service');
const uuid = require('uuid');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt

const LocalStrategy = require('passport-local').Strategy;

const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const FacebookTokenStrategy = require('passport-facebook-token');
const LinkedinTokenStrategy = require('passport-linkedin-token-oauth2').Strategy;
const GoogleTokenStrategy = require('passport-google-token').Strategy;

const DEFAULT_USER_ROLE = 'user';


const configureJwt = (passport, User) => {

  return () => {

    // access token
    passport.use('access-token', new JwtStrategy({
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeader()
    }, (jwtPayload, fn) => {
      User.findById(jwtPayload.userId, (err, user) => {
        if (err) return fn(err, false);

        if (user) {
          fn(null, user);
        } else {
          fn(null, false);
        }
      });
    }));

    debug('access-token strategy registered.');


    // refresh token
    passport.use('refresh-token', new JwtStrategy({
      secretOrKey: process.env.REFRESH_TOKEN_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeader(),
      passReqToCallback: true
    }, (req, jwtPayload, fn) => {
      User.findById(jwtPayload.userId, (err, user) => {
        if (err) return fn(err, false);

        if (user) {
          req.token = jwtPayload.token;
          fn(null, user);
        } else {
          fn(null, false);
        }
      });
    }));

    debug('refresh-token strategy registered.');

  };

};

const configureLocal = (passport, User) => {

  return () => {

    // signup
    passport.use('local-signup', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    }, (req, email, password, fn) => {

      email = email.toLowerCase();

      let errors = validation.validateEmail(email);
      if (Object.keys(errors).length > 0) {
        let err = new Error('Email validation failed.');
        err.status = 400;
        err.errors = errors;
        return fn(err);
      }

      errors = validation.validatePassword(password);
      if (Object.keys(errors).length > 0) {
        let err = new Error('Password validation failed.');
        err.status = 400;
        err.errors = errors;
        return fn(err);
      }

      User.findOne({
        'memberships.provider': 'email',
        'memberships.id': email
      }, (err, user) => {
        if (err) return fn(err);

        // check if user already exists
        if (user) {
          let err = new Error(`The email is already in use.`);
          err.status = 409;
          return fn(err);
        }

        const newUser = new User();
        newUser.hashPassword(password, (err, hash) => {
          if (err) return fn(err);

          const membership = {
            id: email,
            provider: 'email',
            email: email,
            password: hash,
            emailVerificationToken: uuid.v4()
          };

          newUser.role = DEFAULT_USER_ROLE;
          newUser.memberships.push(membership);

          newUser.save((err) => {
            if (err) return fn(err);

            req.profile = membership;
            req.profile.isNewUser = true;

            return fn(null, newUser);
          });

        });

      });

    }));

    debug('local-signup strategy registered.');


    // signin
    passport.use('local-signin', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    }, (req, email, password, fn) => {
      email = email.toLowerCase();

      User.findOne({
        memberships: {
          $elemMatch: {
            provider: 'email',
            id: email
          }
        }}, {
          role: 1,
          created: 1,
          refreshTokens: 1,
          'memberships.$': 1
        }, (err, user) => {
          if (err) return fn(err);

          if (!user) {
            let err = new Error(`Please provide a valid email address.`);
            err.status = 400;
            return fn(err, false);
          }

          const memberships = user.memberships.filter(m => m.provider === 'email');
          let membership = memberships[0];

          if (!membership.isVerified) {
            let err = new Error(`Your email is not verified. To verify your account please check your email and verify.`);
            err.status = 403;
            return fn(err, false);
          }

          // checking password
          user.validatePassword(password, membership.password, (err, isValid) => {
            if (err) return fn(err);

            fn(null, isValid ? user : false);
          });

        });
    }));

    debug('local-signin strategy registered.');

  };

};

/**
 * Creates membership data from social profile data.
 *
 * @param      {Object}    profile  Social profile data.
 * @param      {string}    token    Social token.
 */
const createMembershipData = (profile, token) => {

  const membership = {
    id: profile.id,
    provider: profile.provider,
    token: token,
    name: profile.displayName,
    email: profile.emails && profile.emails[0].value,
    emailVerificationToken: uuid.v4()
  };

  return membership;
}

/**
 * Creates new user data for provided membership data.
 *
 * @param      {Object}  membership  Membership data.
 */
const createUserData = (User, membership) => {

  const newUser = new User();
  newUser.role = DEFAULT_USER_ROLE;
  newUser.memberships.push(membership);

  return newUser;
}

/**
 * Gets or creates new user by social provider and profile id.
 *
 * @param      {Object}    profile  Social profile data.
 * @param      {string}    token    Social token.
 * @param      {Function}  fn       Callback.
 */
const getOrInitUser = (User, profile, token, fn) => {

  User.findOne({
    'memberships.provider': profile.provider,
    'memberships.id': profile.id
  }, (err, user) => {
    if (err) return fn(err);

    if (!user) {
      // if there is no user registered, creating new user
      const membership = createMembershipData(profile, token);
      user = createUserData(User, membership);

      // setting flag to distinguish new profiles
      profile.isNewUser = true;
    } else {
      profile.isNewUser = false;
    }

    fn(err, user);
  });
};


const configureOAuth = (passport, User) => {

  return () => {

    // Facebook
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_CLIENTID,
      clientSecret: process.env.FACEBOOK_CLIENTSECRET,
      callbackURL: '/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email'],
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, fn) => {
      req.profile = profile;
      getOrInitUser(User, profile, accessToken, fn);
    }));

    debug('facebook strategy registered.');


    // LinkedIn
    passport.use(new LinkedInStrategy({
      consumerKey: process.env.LINKEDIN_CLIENTID,
      consumerSecret: process.env.LINKEDIN_CLIENTSECRET,
      callbackURL: '/linkedin/callback',
      profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline', 'picture-url'],
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, fn) => {
      req.profile = profile;
      getOrInitUser(User, profile, accessToken, fn);
    }));

    debug('linkedin strategy registered.');


    // Google
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENTSECRET,
      callbackURL: '/google/callback',
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, fn) => {
      req.profile = profile;
      getOrInitUser(User, profile, accessToken, fn);
    }));

    debug('google strategy registered.');

  };

};

const configureMobileOAuth = (passport, User) => {

  return () => {

    // Facebook
    passport.use(new FacebookTokenStrategy({
      clientID: process.env.FACEBOOK_CLIENTID,
      clientSecret: process.env.FACEBOOK_CLIENTSECRET,
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, fn) => {
      req.profile = profile;
      getOrInitUser(User, profile, accessToken, fn);
    }));

    debug('facebook token strategy registered.');


    // LinkedIn
    passport.use(new LinkedinTokenStrategy({
      clientID: process.env.LINKEDIN_CLIENTID,
      clientSecret: process.env.LINKEDIN_CLIENTSECRET,
      customHeaders: { 'x-li-src': 'msdk' },
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, fn) => {
      req.profile = profile;
      getOrInitUser(User, profile, accessToken, fn);
    }));

    debug('linkedin token strategy registered.');


    // Google
    passport.use(new GoogleTokenStrategy({
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENTSECRET,
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, fn) => {
      req.profile = profile;
      getOrInitUser(User, profile, accessToken, fn);
    }));

    debug('google token strategy registered.');

  };

};


const configure = (passport, User) => {

  return () => {

    debug('Configuring passport strategies...');

    configureJwt(passport, User)();
    configureLocal(passport, User)();
    configureOAuth(passport, User)();
    configureMobileOAuth(passport, User)();
  };

};


module.exports = (passport, models) => {

  const User = models.User;

  return {

    /**
     * Configures passport strategy for JWT.
     */
    configureJwt: configureJwt(passport, User),

    /**
     * Configures passport for local registrations.
     */
    configureLocal: configureLocal(passport, User),

    /**
     * Configures passport for Oauth providers.
     */
    configureOAuth: configureOAuth(passport, User),

    /**
     * Configures passport strategies.
     */
    configure: configure(passport, User)

  };

};

