import { readFileSync } from 'node:fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import analyticsResolvers from './analytics/analytics-resolvers.js';
import attendanceResolvers from './attendance/attendance-resolvers.js';
import reportDownloadLogResolvers from './audit/reportDownloadLog-resolvers.js';
import coachRatingResolvers from './coach/coachRating-resolvers.js';
import coachRequestResolvers from './coachRequest/coachRequest-resolvers.js';
import equipmentResolvers from './equipment/equipment-resolvers.js';
import goalResolvers from './goal/goal-resolvers.js';
import membershipResolvers from './membership/membership-resolvers.js';
import subscriptionRequestResolvers from './membership/subscriptionRequest-resolvers.js';
import notificationResolvers from './notification/notification-resolvers.js';
import progressResolvers from './progress/progress-resolvers.js';
import sessionResolvers from './session/session-resolvers.js';
import userResolvers from './user/user-resolvers.js';
import walkInResolvers from './walkIn/walkIn-resolvers.js';

const schemaFiles = [
	'./analytics/analytics-typeDefs.graphql',
	'./attendance/attendance-typeDefs.graphql',
	'./audit/reportDownloadLog-typeDefs.graphql',
	'./coach/coachRating-typeDefs.graphql',
	'./coachRequest/coachRequest-typeDefs.graphql',
	'./equipment/equipment-typeDefs.graphql',
	'./goal/goal-typeDefs.graphql',
	'./membership/membership-typeDefs.graphql',
	'./membership/subscriptionRequest-typeDefs.graphql',
	'./notification/notification-typeDefs.graphql',
	'./progress/progress-typeDefs.graphql',
	'./session/session-typeDefs.graphql',
	'./user/user-typeDefs.graphql',
	'./walkIn/walkIn-typeDefs.graphql',
] as const;

const typeDefs = schemaFiles.map((relativePath) =>
	readFileSync(new URL(relativePath, import.meta.url), 'utf8'),
);

const resolvers = [
	analyticsResolvers,
	attendanceResolvers,
	reportDownloadLogResolvers,
	coachRatingResolvers,
	coachRequestResolvers,
	equipmentResolvers,
	goalResolvers,
	membershipResolvers,
	subscriptionRequestResolvers,
	notificationResolvers,
	progressResolvers,
	sessionResolvers,
	userResolvers,
	walkInResolvers,
];

const schema = makeExecutableSchema({
	typeDefs: mergeTypeDefs(typeDefs),
	resolvers: mergeResolvers(resolvers),
});

export default schema;
