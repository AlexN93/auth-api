/**
 * Email API client.
 */

// env
if (!process.env.BEARER_TOKEN) {
  console.log('BEARER_TOKEN environment variable required.');
  process.exit(1);
}

if (!process.env.EMAILS_API) {
  console.log("EMAILS_API environment variable required.");
  process.exit(1);
}

if (!process.env.TEMPLATES_API) {
  console.log("TEMPLATES_API environment variable required.");
  process.exit(1);
}

if (!process.env.RESTORE_PASSWORD_TEMPLATE) {
  console.log("RESTORE_PASSWORD_TEMPLATE environment variable required.");
  process.exit(1);
}


const request = require('request');
const debug = require('debug')('auth:emails.service');

const EMAILS_API = process.env.EMAILS_API;
const EMAILS_API_VERSION = '0.0';

const TEMPLATES_API = process.env.TEMPLATES_API;
const TEMPLATES_API_VERSION = '0.0';

const BEARER_TOKEN = process.env.BEARER_TOKEN;
const RESTORE_PASSWORD_TEMPLATE = process.env.RESTORE_PASSWORD_TEMPLATE;

const getTemplateData = (name, fn) => {

  const url = `${TEMPLATES_API}/v${TEMPLATES_API_VERSION}/${name}`;

  debug(`Getting email template data from URL ${url}`);

  request({
    url: url,
    headers: {
      'Authorization': `Bearer ${BEARER_TOKEN}`
    }
  }, function (err, response, body) {
    if (err) return fn(err);

    if (response.statusCode !== 200) {
      return fn(new Error(`Invalid status code received: ${response.statusCode}`));
    }

    debug(`Response: ${body}`);

    if (!body) {
      return fn();
    }

    const json = JSON.parse(body);

    fn(null, json);
  });

};

const fillTemplateBody = (body, variables) => {
  for (var property in variables) {
    body = body.replace(`<<${property}>>`, variables[property]);
  }
  return body;
};

const sendEmail = (data, fn) => {

  const url = `${EMAILS_API}/v${EMAILS_API_VERSION}/`;

  debug(`Sending email from URL ${url}`);

  request({
    uri: url,
    headers: {
      'Authorization': `Bearer ${BEARER_TOKEN}`
    },
    json: data,
    method: 'POST'
  }, function (err, response, body) {
    if (err) return fn(err);

    if (response.statusCode !== 200) {
      return fn(new Error(`Invalid status code received: ${response.statusCode}`));
    }

    debug(`Response: ${body}`);

    if (!body) {
      return fn();
    }

    if (body[0].statusCode !== 202) {
      return fn(new Error(`Email did not send: ${body[0].statusCode}`));
    }

    fn(null, body[0]);
  });

};

const sendNewPasswordEmail = () => {

  return (email, password, fn) => {

    getTemplateData(RESTORE_PASSWORD_TEMPLATE, (err, template) => {
      if (err) {
        fn(err);
      }

      let body = fillTemplateBody(template.body, {new_password: password});

      sendEmail({
        emails: [email],
        subject: template.subject,
        body: body
      }, (err, email) => {
        if (err) {
          fn(err);
        }

        debug('Email message sent successfully', email);

        fn(null, {data: email});
      });
    });
  };

};

module.exports = {

  /**
   * Send new password via email.
   */
  sendNewPasswordEmail: sendNewPasswordEmail()

};
