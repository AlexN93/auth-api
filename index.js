/**
 * Authentication API service.
 */

// env
if (!process.env.SESSION_SECRET) {
  console.log('SESSION_SECRET environment variable required.');
  process.exit(1);
}

if (!process.env.MONGODB_CONNECTION) {
  console.log('MONGODB_CONNECTION environment variable required.');
  process.exit(1);
}

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const services = require('./lib/services');
const models = require('./lib/models');

const errors = require('./lib/routes/errors');
const routes = require('./lib/routes')(passport);

// Init
services.users(models).registerAdminUser((err) => {
  if (err) return console.error(`Could not register admin user: ${JSON.stringify(err)}`);
});

// Express app
const app = express();

app.use(express.static(__dirname + '/public'));

// CORS
app.use(cors({ allowedHeaders: 'Authorization, Content-Type' }));

// logger
if (app.get('env') === 'development') {
  app.use(logger('dev'));
} else {
  app.use(logger());
}

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// passport with session support for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({ url: process.env.MONGODB_CONNECTION })
}));

services.passport(passport, models).configure();
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/', routes);

// error handlers
app.use(errors.notfound);
app.use(errors.error);

module.exports = app;
