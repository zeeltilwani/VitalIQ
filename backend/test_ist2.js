process.env.TZ = 'Asia/Kolkata';
// Suppose Postgres returns a Date object at UTC midnight (which happens if timezone is UTC)
const userData = { last_logged_date: new Date('2026-05-01T00:00:00.000Z'), current_streak: 2 };

// Suppose it is 1 PM IST on May 1st
const now = new Date('2026-05-01T13:00:00.000+05:30');

const todayStr = now.toLocaleDateString('en-CA');
const lastLog = new Date(userData.last_logged_date);
const lastDateStr = lastLog.toLocaleDateString('en-CA');

const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toLocaleDateString('en-CA');

console.log("IST Test 2:", { todayStr, lastDateStr, yesterdayStr });
