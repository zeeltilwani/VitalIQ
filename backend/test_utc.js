process.env.TZ = 'UTC';
const userData = { last_logged_date: new Date('2026-05-01T00:00:00.000Z'), current_streak: 2 };
const now = new Date('2026-05-01T15:00:00.000Z');

const todayStr = now.toLocaleDateString('en-CA');
const lastLog = new Date(userData.last_logged_date);
const lastDateStr = lastLog.toLocaleDateString('en-CA');

console.log("UTC Test:", { todayStr, lastDateStr });
