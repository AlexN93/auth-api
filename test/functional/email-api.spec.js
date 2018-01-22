/**
 * Email API tests.
 */

const request = require('supertest');
const chai = require('chai');
const mongoose = require('mongoose');
const app = require('../../');

// configure chai
const expect = chai.expect;
chai.should();

const snsService = require("../../lib/services/sns.service.js");
const emailsService = require("../../lib/services/emails.service.js");

let snsMessage = null;
snsService.publishSignupMessage = (msg, fn) => {
  snsMessage = msg;

  fn(null, 1);
};

let resetPassword = null;
emailsService.sendNewPasswordEmail = (email, password, fn) => {
  resetPassword = password;

  fn(null, {data: email});
};

describe('Email Signup API', () => {

  let user = {
      email: new Date().getUTCMilliseconds() + '@mail.com',
      password: 'somerandompassword'
    },
    credentials = {};

  describe('/POST email signup', () => {
    it('sign up with empty email', (done) => {
      request(app)
        .post('/email/signup')
        .set('Accept', 'application/json')
        .send({
          email: '',
          password: user.password
        })
        .expect(400)
        .end((err, res) => {
          expect(err).to.be.null;

          let body = res.body;
          expect(body).to.be.an('object');
          done();
        });
    });
  });

  describe('/POST email signup', () => {
    it('sign up with empty password', (done) => {
      request(app)
        .post('/email/signup')
        .set('Accept', 'application/json')
        .send({
          email: user.email,
          password: ''
        })
        .expect(400)
        .end((err, res) => {
          expect(err).to.be.null;

          let body = res.body;
          expect(body).to.be.an('object');
          done();
        });
    });
  });

  describe('/POST email signup', () => {
    it('sign up with email', (done) => {
      request(app)
        .post('/email/signup')
        .set('Accept', 'application/json')
        .send(user)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.null;

          done();
        });
    });
  });

  describe('/POST email signup', () => {
    it('sign up with already used email', (done) => {
      request(app)
        .post('/email/signup')
        .set('Accept', 'application/json')
        .send(user)
        .expect(409)
        .end((err, res) => {
          expect(err).to.be.null;

          let body = res.body;
          expect(body).to.be.an('object');
          expect(body.message).to.equal('The email is already in use.');
          done();
        });
    });
  });

  describe('/POST email signin', () => {
    it('sign in with unverified email', (done) => {
      request(app)
        .post('/email/signin')
        .set('Accept', 'application/json')
        .send(user)
        .expect(403)
        .end((err, res) => {
          expect(err).to.be.null;

          let body = res.body;
          expect(body).to.be.an('object');
          expect(body.message).to.equal('Your email is not verified. To verify your account please check your email and verify.');
          done();
        });
    });
  });

  describe('/GET email verification', () => {
    it('verify email account', (done) => {
      request(app)
        .get(`/email/verification?token=${snsMessage.profile.emailVerificationToken}`)
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          expect(err).to.be.null;

          done();
        });
    });
  });

  describe('/POST email signin', () => {
    it('sign in with wrong email', (done) => {
      request(app)
        .post('/email/signin')
        .set('Accept', 'application/json')
        .send({
          email: new Date().getUTCMilliseconds() + user.email,
          password: user.password
        })
        .expect(400)
        .end((err, res) => {
          expect(err).to.be.null;

          let body = res.body;
          expect(body).to.be.an('object');
          expect(body.message).to.equal('Please provide a valid email address.');
          done();
        });
    });
  });

  describe('/POST email signin', () => {
    it('sign in with wrong password', (done) => {
      request(app)
        .post('/email/signin')
        .set('Accept', 'application/json')
        .send({
          email: user.email,
          password: user.password + new Date().getUTCMilliseconds()
        })
        .expect(401)
        .end((err, res) => {
          expect(err).to.be.null;

          done();
        });
    });
  });

  describe('/POST email signin', () => {
    it('sign in with email', (done) => {
      request(app)
        .post('/email/signin')
        .set('Accept', 'application/json')
        .send(user)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.null;

          credentials = res.body;
          expect(credentials).to.be.an('object');
          expect(credentials).to.have.property('userId');
          expect(credentials).to.have.property('accessToken');
          expect(credentials).to.have.property('refreshToken');
          done();
        });
    });
  });

  describe('/GET account', () => {
    it('get account info', (done) => {
      request(app)
        .get('/account')
        .set('Accept', 'application/json')
        .set('Authorization', 'JWT ' + credentials.accessToken)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.null;

          let account = res.body;
          expect(account).to.be.an('object');
          expect(account).to.have.property('id');
          expect(account).to.have.property('role');
          expect(account).to.have.property('created');
          expect(account).to.have.property('memberships');
          expect(account.memberships[0]).to.have.property('id');
          expect(account.memberships[0]).to.have.property('provider');
          expect(account.memberships[0]).to.have.property('email');
          done();
        });
    });
  });

  describe('/GET account', () => {
    it('get account info without credentials', (done) => {
      request(app)
        .get('/account')
        .set('Accept', 'application/json')
        .expect(401)
        .end((err, res) => {
          expect(err).to.be.null;
          done();
        });
    });
  });

  describe('/GET new token', () => {
    it('refresh token', (done) => {
      request(app)
        .get('/token/refresh')
        .set('Accept', 'application/json')
        .set('Authorization', 'JWT ' + credentials.refreshToken)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.null;

          credentials = res.body;
          expect(credentials).to.be.an('object');
          expect(credentials).to.have.property('accessToken');
          expect(credentials).to.have.property('refreshToken');
          done();
        });
    });
  });

  describe('/GET account', () => {
    it('get account info with new token', (done) => {
      request(app)
        .get('/account')
        .set('Accept', 'application/json')
        .set('Authorization', 'JWT ' + credentials.accessToken)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.null;

          let account = res.body;
          expect(account).to.be.an('object');
          expect(account).to.have.property('id');
          expect(account).to.have.property('role');
          expect(account).to.have.property('created');
          expect(account).to.have.property('memberships');
          expect(account.memberships[0]).to.have.property('id');
          expect(account.memberships[0]).to.have.property('provider');
          expect(account.memberships[0]).to.have.property('email');
          done();
        });
    });
  });

  describe('/PUT change password', () => {
    it('change password', (done) => {
      request(app)
        .put('/email/change-password')
        .set('Accept', 'application/json')
        .set('Authorization', 'JWT ' + credentials.accessToken)
        .send({
          oldPassword: user.password,
          password: user.password + 'new'
        })
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.null;
          user.password += 'new';
          done();
        });
    });
  });

  describe('/POST email signin', () => {
    it('sign in with email and new password', (done) => {
      request(app)
        .post('/email/signin')
        .set('Accept', 'application/json')
        .send(user)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.null;

          credentials = res.body;
          expect(credentials).to.be.an('object');
          expect(credentials).to.have.property('userId');
          expect(credentials).to.have.property('accessToken');
          expect(credentials).to.have.property('refreshToken');
          done();
        });
    });
  });

  describe('/PUT reset password', () => {
    it('reset password without email', (done) => {
      request(app)
        .put('/email/reset-password')
        .set('Accept', 'application/json')
        .expect(400)
        .end((err, res) => {
          expect(err).to.be.null;

          done();
        });
    });
  });

  describe('/PUT reset password', () => {
    it('reset password', (done) => {
      request(app)
        .put('/email/reset-password')
        .set('Accept', 'application/json')
        .send({
          email: user.email
        })
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.null;

          user.password = resetPassword;
          done();
        });
    });
  });

  describe('/POST email signin', () => {
    it('sign in with email and new resetted password', (done) => {
      request(app)
        .post('/email/signin')
        .set('Accept', 'application/json')
        .send(user)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.null;

          credentials = res.body;
          expect(credentials).to.be.an('object');
          expect(credentials).to.have.property('userId');
          expect(credentials).to.have.property('accessToken');
          expect(credentials).to.have.property('refreshToken');
          done();
        });
    });
  });

  describe('/DELETE logout', () => {
    it('delete refresh token', (done) => {
      request(app)
        .delete('/signout')
        .set('Accept', 'application/json')
        .set('Authorization', 'JWT ' + credentials.refreshToken)
        .expect(200)
        .end((err, res) => {
          expect(err).to.be.null;
          done();
        });
    });
  });

});
