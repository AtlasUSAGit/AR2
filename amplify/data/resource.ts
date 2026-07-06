import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // Ensure this matches the exact casing your components are calling
  AppElement: a.model({
    type: a.string(),
    content: a.string(),
    isChecked: a.boolean(),
    position: a.integer()
  }).authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated()
  ]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});