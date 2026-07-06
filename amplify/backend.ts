import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource'; // 1. Import authentication
import { data } from './data/resource';
import { storage } from './storage/resource';

/**
 * @database UKBFC Command Core
 * Initializes full-stack modules with active authentication identities
 */
defineBackend({
  auth, // 2. Bind auth to resolve guest roles
  data,
  storage,
});