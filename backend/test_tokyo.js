process.env.TZ = 'Asia/Tokyo';
// Suppose Postgres returns a Date object at UTC midnight (which happens if timezone is UTC)
const userData = { last_logged_date: new Date('2026-05-01T00:00:00.000Z'), current_streak: 2 };

// Suppose it is 8 AM Tokyo on May 1st
const now = new Date('2026-05-01T08:00:00.000+09:00');

const todayStr = now.toLocaleDateString('en-CA');
const lastLog = new Date(userData.last_logged_date);
const lastDateStr = lastLog.toLocaleDateString('en-CA');

const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toLocaleDateString('en-CA');

console.log("Tokyo Test:", { todayStr, lastDateStr, yesterdayStr });
