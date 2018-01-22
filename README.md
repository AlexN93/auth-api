# auth-api
Token-based Authentication API microservice.

## Environment Variables
The service should be properly configured with following environment variables.

Key | Value | Description
:-- | :-- | :-- 
MONGODB_CONNECTION | mongodb://watstock:watstock123@mongo.wtst.io:27017/auth | MongoDB connection string.
DEBUG | auth* | Enable debugging.
ACCESS_TOKEN_SECRET | VxqvqY3gG8tMcqAe | Access token secret.
ACCESS_TOKEN_TIMEOUT | 604800 | Access token expiration timeout in seconds.
REFRESH_TOKEN_SECRET | QnYurPLFvkmzF5J8 | Refresh token secret.
REFRESH_TOKEN_TIMEOUT | 2592000 | Refresh token expiration timeout in seconds.
FACEBOOK_CLIENTID | 430990423966766 | Facebook client id.
FACEBOOK_CLIENTSECRET | 0277037c85fb866747ec23f5d6622cd8 | Facebook client secret.
LINKEDIN_CLIENTID | 81tkdpkl3hery6 | LinkedIn client id.
LINKEDIN_CLIENTSECRET | 1RjcgVzWAk2LIB18 | LinkedIn client secret.
GOOGLE_CLIENTID | 729088722278-kjp10es7c3bvjhg91mato3egj2f0pndf.apps.googleusercontent.com | Google client id.
GOOGLE_CLIENTSECRET | 87yHtAthsSUrq_R9pcFB4KON | Google client secret.
ADMIN_EMAIL | email@mail.com | Admin email.
ADMIN_PASSWORD | p@ssword | Admin password.
SESSION_SECRET | watstockhotstock | Secret key for session encryption.
SNS_SIGNUP_TOPIC_ARN | arn:aws:sns:us-east-1:208202057447:hotstock-account-signup | ARN for the SNS topic to publish signup messages.
AWS_REGION | us-east-1 | AWS SDK region to publish messages to SNS topics.
EMAILS_API | http://emails.wtst.io | Email API URL.
TEMPLATES_API | http://emails-templates.wtst.io | Email Templates API URL.
RESTORE_PASSWORD_TEMPLATE | forgotten_password | Template name for forgotten password
