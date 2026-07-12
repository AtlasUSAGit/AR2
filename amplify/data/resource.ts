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
  Mindmap: a.model({
    name: a.string(),
    nodes: a.string(),
    edges: a.string()
  }).authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated()
  ]),
  KanbanQuestion: a.model({
    question: a.string(),
    options: a.string(),
    answers: a.string()
  }).authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated()
  ]),
  KanbanCard: a.model({
    colId: a.string(),
    title: a.string(),
    priority: a.string(),
    atlasId: a.string()
  }).authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated()
  ]),
  HomeElement: a.model({
    elementId: a.string(),
    content: a.string()
  }).authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated()
  ]),
  HubDocumentStatus: a.model({
    docId: a.string(),
    status: a.string(),
    customTitle: a.string(),
    customSubtitle: a.string(),
    isDeleted: a.boolean(),
    filePath: a.string()
  }).authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated()
  ]),
  HubChecklist: a.model({
    title: a.string(),
    items: a.string()
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