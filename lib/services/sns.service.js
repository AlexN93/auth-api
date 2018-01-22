/**
 * AWS SNS client.
 */

// env
if (!process.env.SNS_SIGNUP_TOPIC_ARN) {
  console.log("SNS_SIGNUP_TOPIC_ARN environment variable required.");
  process.exit(1);
}
const SNS_SIGNUP_TOPIC_ARN = process.env.SNS_SIGNUP_TOPIC_ARN;

const SNS_SIGNUP_MESSAGE_SUBJECT = 'Account Signup';

const debug = require('debug')('auth:sns.service');
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

const publishSignupMessage = (msg, fn) => {

  debug(`Publishing signup message: ${JSON.stringify(msg)}`);


  fn(null, 1);

 // sns.publish({
 //   TopicArn: SNS_SIGNUP_TOPIC_ARN,
 //   Message: JSON.stringify(msg),
 //   Subject: SNS_SIGNUP_MESSAGE_SUBJECT
 // }, (err, data) => {
 //   if (err) {
 //     debug(`Signup message publishing error: ${err}`);
 //     return fn(err);
 //   }
 //
 //   debug(`Signup message published: ${data.MessageId}`);
 //   fn(null, data.MessageId);
 //});

};

module.exports = {

  /**
   * Creates default admin user.
   */
  publishSignupMessage: publishSignupMessage

};
