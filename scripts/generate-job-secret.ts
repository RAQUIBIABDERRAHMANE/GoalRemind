import crypto from 'crypto';

console.log('Generating Job API Secret...\n');

const secret = crypto.randomBytes(32).toString('hex');

console.log('Job API Secret Generated Successfully!\n');
console.log('Add this to your .env.local file:\n');
console.log('JOB_API_SECRET=' + secret);
console.log('\n');
console.log('Use this token when calling the job endpoint:');
console.log('curl -X POST "http://localhost:3000/api/jobs/send-due-reminders?token=' + secret + '"');
console.log('\n');
