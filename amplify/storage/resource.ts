import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'ukbfcCoreMedia',
    access: (allow) => ({
        // Allows anyone (guests and users) to play intro assets
        'intros/*': [
            allow.guest.to(['read']),
            allow.authenticated.to(['read', 'write', 'delete'])
        ]
    })
});