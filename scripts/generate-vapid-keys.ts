import webpush from 'web-push';

console.log('Generating VAPID keys...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys Generated Successfully!\n');
console.log('Add these to your .env.local file:\n');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_SUBJECT=mailto:your-email@example.com');
console.log('\n');
