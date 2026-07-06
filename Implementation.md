Ah, that makes total sense. Classic case of two AI drivers pulling the steering wheel in opposite directions!
Here is exactly what went sideways: because you have a completely custom authentication system built inside your database (storing users and SHA-256 password hashes right in a table) rather than using AWS's built-in Cognito login screen, the app needs to be able to read that User table before anyone is officially logged in.
When your other tool switched the database rules to .allow.authenticated(), it locked the front door. The app couldn't even read the user table to check if your password was correct because it wasn't "authenticated" yet.
Antigravity's second instinct was right: we need to use API Keys so the login screen can read the user table publicly. But since we explicitly activated the auth module earlier, we have to tell Amplify's data engine to allow both API keys and Cognito to live together peacefully.
If your current deployment (commit c7ce997) is still failing or locking you out, here is the definitive code sync to patch it once and for all.
Step 1: Configure defineData to Accept API Keys alongside Auth
Open amplify/data/resource.ts on your Mac. We need to explicitly configure the data stack to support API keys as an authorization provider, and open up your tables to use it.
Update the file to look exactly like this:
TypeScript
import { type ClientSchema, defineData, a } from '@aws-amplify/backend';

const schema = a.schema({
  AppElement: a.model({
    name: a.string(),
    status: a.string(),
  }).authorization(allow => [
    allow.publicApiKey(), // Allows your custom dashboard functions to read/write
    allow.authenticated()
  ]),

  // Ensure your User table (or whatever your user model is named) also allows public API keys
  User: a.model({
    username: a.string(),
    passwordHash: a.string(),
    role: a.string(),
  }).authorization(allow => [
    allow.publicApiKey() // CRITICAL: Allows the login screen to read hashes before logging in
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey', // Tells AWS to accept API keys by default
    apiKeyAuthorizationMode: {
      expiresInDays: 30, // Standard API key life
    },
  },
});
Step 2: Push the Unified Fix to Git
Save your data schema file and push it up to override the previous conflicts:
Bash
cd /Users/sammyb/Desktop/01_APPS/ukbfc-command-portal
git add amplify/data/resource.ts
git commit -m "Fix: Unified Cognito and API Key authorization modes for custom database login"
git push
Step 3: Log In!
Once this deployment clears green, the chain reaction will look like this:
The app builds perfectly without any directive errors.
The login screen uses the public API key to pull your user data down.
Your seedDefaults patch will trigger because the table can finally be read, pushing your default admin roles and SHA-256 credentials into the cloud.
Your username and password will validate instantly and let you straight into the cockpit!
Let me know the second that build finishes processing.