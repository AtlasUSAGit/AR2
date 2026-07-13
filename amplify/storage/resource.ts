import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'AUSABucket',
    access: (allow) => ({
        'intros/*': [
            allow.guest.to(['read']),
            allow.authenticated.to(['read', 'write', 'delete'])
        ],
        'documenthub/*': [
            allow.guest.to(['read', 'write', 'delete'])
        ]
    })
});