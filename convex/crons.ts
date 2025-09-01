import { cronJobs } from "convex/server";

const crons = cronJobs();

// Example scheduled jobs - these would be implemented as needed

// Clean up expired sessions every hour
// crons.interval(
//   "cleanup expired sessions",
//   { hours: 1 },
//   internal.cleanup.expiredSessions,
// );

// Daily membership expiry check at 9 AM UTC
// crons.daily(
//   "check membership expiry",
//   { hourUTC: 9, minuteUTC: 0 },
//   internal.memberships.checkExpiring,
// );

// Weekly reports on Mondays at 6 AM UTC
// crons.weekly(
//   "weekly reports", 
//   { dayOfWeek: "monday", hourUTC: 6, minuteUTC: 0 },
//   internal.reports.generateWeekly,
// );

// Note: These cron jobs are commented out until the corresponding internal functions are implemented
// This file demonstrates the structure for scheduled jobs in the application

export default crons;