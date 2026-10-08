// Export all GraphQL operations for easy imports throughout the application

// Queries
export {
	MeDocument as GET_ME,
	GetEquipmentsDocument as GET_EQUIPMENTS,
	GetEquipmentsLegacyDocument as GET_EQUIPMENTS_LEGACY,
	GetEquipmentDocument as GET_EQUIPMENT,
	GetAllMembershipsDocument as GET_ALL_MEMBERSHIPS,
	GetActiveMembershipsDocument as GET_ACTIVE_MEMBERSHIPS,
	GetCurrentMembershipDocument as GET_CURRENT_MEMBERSHIP,
	GetUsersDocument as GET_USERS,
	GetUserDocument as GET_USER,
	GetPendingSubscriptionRequestsDocument as GET_PENDING_SUBSCRIPTION_REQUESTS,
	GetAllSubscriptionRequestsDocument as GET_ALL_SUBSCRIPTION_REQUESTS,
	GetRevenueSummaryDocument as GET_REVENUE_SUMMARY,
	GetAnalyticsDocument as GET_ANALYTICS,
	GetAnalyticsRangeDocument as GET_ANALYTICS_RANGE,
	GetCoachSessionsDocument as GET_COACH_SESSIONS,
	CreateSessionDocument as CREATE_SESSION,
	GetCoachSessionLogsDocument as GET_COACH_SESSION_LOGS,
	GetGoalsForClientDocument as GET_GOALS_FOR_CLIENT,
	GetMyNotificationsDocument as GET_MY_NOTIFICATIONS,
} from '../generated/graphql';

// Mutations
export {
	LoginDocument as LOGIN,
	CreateUserDocument as CREATE_USER,
	UpdateUserDocument as UPDATE_USER,
	DeleteUserDocument as DELETE_USER,
	DisableUserDocument as DISABLE_USER,
	EnableUserDocument as ENABLE_USER,
	CreateMembershipDocument as CREATE_MEMBERSHIP,
	UpdateMembershipDocument as UPDATE_MEMBERSHIP,
	DeleteMembershipDocument as DELETE_MEMBERSHIP,
	CreateEquipmentDocument as CREATE_EQUIPMENT,
	CreateEquipmentLegacyDocument as CREATE_EQUIPMENT_LEGACY,
	UpdateEquipmentDocument as UPDATE_EQUIPMENT,
	UpdateEquipmentLegacyDocument as UPDATE_EQUIPMENT_LEGACY,
	DeleteEquipmentDocument as DELETE_EQUIPMENT,
	ArchiveEquipmentDocument as ARCHIVE_EQUIPMENT,
	UnarchiveEquipmentDocument as UNARCHIVE_EQUIPMENT,
	AdjustEquipmentStockDocument as ADJUST_EQUIPMENT_STOCK,
	PurchaseMembershipDocument as PURCHASE_MEMBERSHIP,
	CancelMembershipDocument as CANCEL_MEMBERSHIP,
	DirectSubscribeMemberDocument as DIRECT_SUBSCRIBE_MEMBER,
	UpdateMembershipTransactionDurationDocument as UPDATE_MEMBERSHIP_TRANSACTION_DURATION,
	ApproveSubscriptionRequestDocument as APPROVE_SUBSCRIPTION_REQUEST,
	RejectSubscriptionRequestDocument as REJECT_SUBSCRIPTION_REQUEST,
	DeleteSubscriptionRequestDocument as DELETE_SUBSCRIPTION_REQUEST,
	LogReportDownloadDocument as LOG_REPORT_DOWNLOAD,
	MarkNotificationReadDocument as MARK_NOTIFICATION_READ,
	MarkAllMyNotificationsReadDocument as MARK_ALL_MY_NOTIFICATIONS_READ,
} from '../generated/graphql';

// Subscriptions
export {
	RevenueSummaryUpdatedDocument as REVENUE_SUMMARY_UPDATED,
	UsersUpdatedDocument as USERS_UPDATED,
	MembershipsUpdatedDocument as MEMBERSHIPS_UPDATED,
	AttendanceRecordAddedDocument as ATTENDANCE_RECORD_ADDED,
	AttendanceUpdatedDocument as ATTENDANCE_UPDATED,
} from '../generated/graphql';

// Attendance Queries
export {
	GetAttendanceRecordsDocument as GET_ATTENDANCE_RECORDS,
	GetAttendanceRecordDocument as GET_ATTENDANCE_RECORD,
} from '../generated/graphql';

// Walk-in clients (admin)
export {
	SearchWalkInClientsDocument as SEARCH_WALK_IN_CLIENTS,
	WalkInAttendanceLogsDocument as WALK_IN_ATTENDANCE_LOGS,
	WalkInStatsDocument as WALK_IN_STATS,
	WalkInAccountsOverviewDocument as WALK_IN_ACCOUNTS_OVERVIEW,
	WalkInLogsByClientDocument as WALK_IN_LOGS_BY_CLIENT,
	CreateWalkInClientDocument as CREATE_WALK_IN_CLIENT,
	UpdateWalkInClientDocument as UPDATE_WALK_IN_CLIENT,
	WalkInTimeInDocument as WALK_IN_TIME_IN,
	WalkInPaymentSettingsDocument as WALK_IN_PAYMENT_SETTINGS,
	UpdateWalkInPaymentSettingsDocument as UPDATE_WALK_IN_PAYMENT_SETTINGS,
	GetReportDownloadLogsDocument as GET_REPORT_DOWNLOAD_LOGS,
} from '../generated/graphql';

