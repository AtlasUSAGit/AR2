import { defineAuth } from '@aws-amplify/backend';

/**
 * Initializes security authorization frameworks to validate guest and user streams
 */
export const auth = defineAuth({
    loginWith: {
        email: true,
    },
});