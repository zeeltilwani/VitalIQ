const userData = { last_logged_date: new Date('2026-05-01T00:00:00.000+05:30'), current_streak: 2 };
const now = new Date('2026-05-01T15:00:00.000+05:30');

const todayStr = now.toLocaleDateString('en-CA');
const lastLog = new Date(userData.last_logged_date);
const lastDateStr = lastLog.toLocaleDateString('en-CA');

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toLocaleDateString('en-CA');

console.log({ todayStr, lastDateStr, yesterdayStr });
