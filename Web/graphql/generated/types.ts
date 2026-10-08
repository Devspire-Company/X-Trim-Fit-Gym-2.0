export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AdjustEquipmentStockInput = {
  change: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type Analytics = {
  __typename?: 'Analytics';
  activeSubscriptions: Scalars['Int']['output'];
  canceledSubscriptions: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  date: Scalars['String']['output'];
  expiredSubscriptions: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  membershipSubscriptionRevenue: Scalars['Float']['output'];
  newSubscriptions: Scalars['Int']['output'];
  revenueByMembership: Array<MembershipRevenue>;
  totalRevenue: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  walkInRevenue: Scalars['Float']['output'];
};

export type ApproveSubscriptionRequestInput = {
  requestId: Scalars['ID']['input'];
};

export type AttendanceConnection = {
  __typename?: 'AttendanceConnection';
  hasMore: Scalars['Boolean']['output'];
  records: Array<AttendanceRecord>;
  totalCount: Scalars['Int']['output'];
};

export type AttendanceFilter = {
  cardNo?: InputMaybe<Scalars['String']['input']>;
  deviceName?: InputMaybe<Scalars['String']['input']>;
  direction?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  personName?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type AttendancePagination = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type AttendanceRecord = {
  __typename?: 'AttendanceRecord';
  authDate: Scalars['String']['output'];
  authDateTime: Scalars['String']['output'];
  authTime: Scalars['String']['output'];
  cardNo?: Maybe<Scalars['String']['output']>;
  deviceName: Scalars['String']['output'];
  deviceSerNum: Scalars['String']['output'];
  direction: Scalars['String']['output'];
  id: Scalars['String']['output'];
  personName: Scalars['String']['output'];
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  token: Scalars['String']['output'];
  user: User;
};

export type ClassEnrollment = {
  __typename?: 'ClassEnrollment';
  client?: Maybe<User>;
  clientId: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  status: ClassEnrollmentStatus;
};

export enum ClassEnrollmentStatus {
  Accepted = 'accepted',
  Declined = 'declined',
  Invited = 'invited',
  Pending = 'pending',
  Rejected = 'rejected'
}

export type CoachDetails = {
  __typename?: 'CoachDetails';
  clientLimit?: Maybe<Scalars['Int']['output']>;
  clientsIds?: Maybe<Array<Maybe<Scalars['ID']['output']>>>;
  moreDetails?: Maybe<Scalars['String']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
  sessionsIds?: Maybe<Array<Maybe<Scalars['ID']['output']>>>;
  specialization?: Maybe<Array<Scalars['String']['output']>>;
  teachingDate?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  teachingTime?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  yearsOfExperience?: Maybe<Scalars['Int']['output']>;
};

export type CoachDetailsInput = {
  clientLimit?: InputMaybe<Scalars['Int']['input']>;
  clientsIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  moreDetails?: InputMaybe<Scalars['String']['input']>;
  ratings?: InputMaybe<Scalars['Float']['input']>;
  sessionsIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  specialization?: InputMaybe<Array<Scalars['String']['input']>>;
  teachingDate?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  teachingTime?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  yearsOfExperience?: InputMaybe<Scalars['Int']['input']>;
};

export type CoachRating = {
  __typename?: 'CoachRating';
  client?: Maybe<User>;
  clientId: Scalars['ID']['output'];
  coach?: Maybe<User>;
  coachId: Scalars['ID']['output'];
  comment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  rating: Scalars['Int']['output'];
  sessionLog?: Maybe<SessionLog>;
  sessionLogId: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type CoachRequest = {
  __typename?: 'CoachRequest';
  client?: Maybe<User>;
  clientId: Scalars['ID']['output'];
  coach?: Maybe<User>;
  coachId: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  message?: Maybe<Scalars['String']['output']>;
  status: CoachRequestStatus;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export enum CoachRequestStatus {
  Approved = 'approved',
  Denied = 'denied',
  Pending = 'pending'
}

export type ConfirmSessionCompletionInput = {
  confirm: Scalars['Boolean']['input'];
  sessionLogId: Scalars['ID']['input'];
};

export type CreateCoachRatingInput = {
  coachId: Scalars['ID']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  rating: Scalars['Int']['input'];
  sessionLogId: Scalars['ID']['input'];
};

export type CreateCoachRequestInput = {
  coachId: Scalars['ID']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
};

export type CreateEquipmentInput = {
  acquiredAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl: Scalars['String']['input'];
  maintenanceStartedAt?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<EquipmentStatus>;
};

export type CreateGoalInput = {
  currentWeight?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  goalType: Scalars['String']['input'];
  targetDate?: InputMaybe<Scalars['String']['input']>;
  targetWeight?: InputMaybe<Scalars['Float']['input']>;
  title: Scalars['String']['input'];
};

export type CreateMembershipInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  durationType: DurationType;
  features: Array<Scalars['String']['input']>;
  monthDuration: Scalars['Int']['input'];
  monthlyPrice: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  status: MembershipStatus;
  statusEffectiveAt?: InputMaybe<Scalars['String']['input']>;
};

export type CreateProgressRatingInput = {
  clientId: Scalars['ID']['input'];
  comment: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  goalId: Scalars['ID']['input'];
  rating: Scalars['Int']['input'];
  sessionLogIds: Array<Scalars['ID']['input']>;
  startDate: Scalars['String']['input'];
  verdict: ProgressVerdict;
};

export type CreateSessionFromTemplateInput = {
  clientsIds: Array<Scalars['ID']['input']>;
  date: Scalars['String']['input'];
  endTime?: InputMaybe<Scalars['String']['input']>;
  goalId?: InputMaybe<Scalars['ID']['input']>;
  startTime: Scalars['String']['input'];
  templateId: Scalars['ID']['input'];
  workoutType?: InputMaybe<Scalars['String']['input']>;
};

export type CreateSessionInput = {
  clientsIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  coachId?: InputMaybe<Scalars['ID']['input']>;
  date: Scalars['String']['input'];
  endTime?: InputMaybe<Scalars['String']['input']>;
  goalId?: InputMaybe<Scalars['ID']['input']>;
  gymArea: Scalars['String']['input'];
  invitedClientIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  isTemplate?: InputMaybe<Scalars['Boolean']['input']>;
  maxParticipants?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  sessionKind?: InputMaybe<SessionKind>;
  startTime: Scalars['String']['input'];
  templateId?: InputMaybe<Scalars['ID']['input']>;
  workoutType?: InputMaybe<Scalars['String']['input']>;
};

export type CreateSessionLogInput = {
  notes?: InputMaybe<Scalars['String']['input']>;
  progressImages: ProgressImagesInput;
  sessionId: Scalars['ID']['input'];
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateSubscriptionRequestInput = {
  membershipId: Scalars['ID']['input'];
};

export type CreateUserInput = {
  agreedToLiabilityWaiver?: InputMaybe<Scalars['Boolean']['input']>;
  agreedToPrivacyPolicy?: InputMaybe<Scalars['Boolean']['input']>;
  agreedToTermsAndConditions?: InputMaybe<Scalars['Boolean']['input']>;
  coachDetails?: InputMaybe<CoachDetailsInput>;
  currentPassword?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['String']['input']>;
  /** Development-only fallback email verification code used when Clerk email quota is exceeded. */
  devVerificationCode?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  guardianIdVerificationPhotoUrl?: InputMaybe<Scalars['String']['input']>;
  heardFrom?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  lastName: Scalars['String']['input'];
  membershipDetails?: InputMaybe<MemberDetailsInput>;
  middleName?: InputMaybe<Scalars['String']['input']>;
  minorLiabilityWaiverPrintedName?: InputMaybe<Scalars['String']['input']>;
  minorLiabilityWaiverSignatureUrl?: InputMaybe<Scalars['String']['input']>;
  /**
   * Password is optional for Clerk-based admin creation (backend generates one).
   * Legacy email/password auth still uses this field.
   */
  password?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  role: RoleType;
};

export type CreateWalkInClientInput = {
  ageYears: Scalars['Int']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  gender: WalkInGender;
  lastName: Scalars['String']['input'];
  middleName?: InputMaybe<Scalars['String']['input']>;
  /** Required when ageYears is under 18: admin confirms guardian waiver on file. */
  minorWaiverAcknowledged?: InputMaybe<Scalars['Boolean']['input']>;
  /** Parent/guardian full name when under 18. */
  minorWaiverGuardianName?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type CreateWalkInClientResult = {
  __typename?: 'CreateWalkInClientResult';
  client: WalkInClient;
  log?: Maybe<WalkInAttendanceLog>;
};

export type DateRangeInput = {
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};

export type DirectSubscribeInput = {
  memberId: Scalars['ID']['input'];
  membershipId: Scalars['ID']['input'];
  /** Override plan length: months from startedAt for monthly/quarterly/yearly plans; **calendar days** for DAILY plans. Defaults to the plan's monthDuration. */
  monthDuration?: InputMaybe<Scalars['Int']['input']>;
  /** When the subscription started (e.g. legacy walk-in). Defaults to now. ISO-8601 string. */
  startedAt?: InputMaybe<Scalars['String']['input']>;
};

export enum DurationType {
  /** Fixed calendar-day promos (plan `monthDuration` = number of days). */
  Daily = 'DAILY',
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  Yearly = 'YEARLY'
}

export type Equipment = {
  __typename?: 'Equipment';
  acquiredAt?: Maybe<Scalars['String']['output']>;
  archiveReason?: Maybe<Scalars['String']['output']>;
  archivedAt?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl: Scalars['String']['output'];
  isArchived: Scalars['Boolean']['output'];
  lifecycleLogs: Array<EquipmentLifecycleLog>;
  maintenanceStartedAt?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Int']['output'];
  sortOrder: Scalars['Int']['output'];
  status: EquipmentStatus;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type EquipmentLifecycleLog = {
  __typename?: 'EquipmentLifecycleLog';
  action: Scalars['String']['output'];
  changedAt: Scalars['String']['output'];
  changedById?: Maybe<Scalars['ID']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  status?: Maybe<EquipmentStatus>;
};

export enum EquipmentStatus {
  Available = 'AVAILABLE',
  Damaged = 'DAMAGED',
  Undermaintenance = 'UNDERMAINTENANCE'
}

export type Goal = {
  __typename?: 'Goal';
  client?: Maybe<User>;
  clientId: Scalars['ID']['output'];
  coach?: Maybe<User>;
  coachId?: Maybe<Scalars['ID']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  currentWeight?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  goalType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  status: GoalStatus;
  targetDate?: Maybe<Scalars['String']['output']>;
  targetWeight?: Maybe<Scalars['Float']['output']>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export enum GoalStatus {
  Active = 'active',
  Cancelled = 'cancelled',
  Completed = 'completed',
  Paused = 'paused'
}

export type LogReportDownloadInput = {
  dateRange?: InputMaybe<ReportDownloadDateRangeInput>;
  fileName?: InputMaybe<Scalars['String']['input']>;
  filterSummary?: InputMaybe<Scalars['String']['input']>;
  metadataJson?: InputMaybe<Scalars['String']['input']>;
  reportType: ReportType;
};

export type LoginHistoryEntry = {
  __typename?: 'LoginHistoryEntry';
  ipAddress?: Maybe<Scalars['String']['output']>;
  loginAt?: Maybe<Scalars['String']['output']>;
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MemberDetails = {
  __typename?: 'MemberDetails';
  coachesIds?: Maybe<Array<Maybe<Scalars['ID']['output']>>>;
  /** Member completed gym/facility biometric enrollment (mobile + web). */
  facilityBiometricEnrollmentComplete?: Maybe<Scalars['Boolean']['output']>;
  fitnessGoal?: Maybe<Array<Scalars['String']['output']>>;
  hasEnteredDetails?: Maybe<Scalars['Boolean']['output']>;
  membershipId?: Maybe<Scalars['ID']['output']>;
  membershipTransaction?: Maybe<MembershipTransaction>;
  physiqueGoalType: Scalars['String']['output'];
  workOutTime?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type MemberDetailsInput = {
  coachesIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  facilityBiometricEnrollmentComplete?: InputMaybe<Scalars['Boolean']['input']>;
  fitnessGoal?: InputMaybe<Array<Scalars['String']['input']>>;
  hasEnteredDetails?: InputMaybe<Scalars['Boolean']['input']>;
  membershipId?: InputMaybe<Scalars['ID']['input']>;
  physiqueGoalType: Scalars['String']['input'];
  workOutTime?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type Membership = {
  __typename?: 'Membership';
  createdAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  durationType: DurationType;
  features: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  monthDuration: Scalars['Int']['output'];
  monthlyPrice: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  status: MembershipStatus;
  statusEffectiveAt?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type MembershipRevenue = {
  __typename?: 'MembershipRevenue';
  count: Scalars['Int']['output'];
  membershipId: Scalars['ID']['output'];
  membershipName: Scalars['String']['output'];
  revenue: Scalars['Float']['output'];
};

export enum MembershipStatus {
  Active = 'ACTIVE',
  ComingSoon = 'COMING_SOON',
  Inactive = 'INACTIVE'
}

export type MembershipTransaction = {
  __typename?: 'MembershipTransaction';
  canceledAt?: Maybe<Scalars['String']['output']>;
  canceledById?: Maybe<Scalars['ID']['output']>;
  canceledReason?: Maybe<Scalars['String']['output']>;
  client?: Maybe<User>;
  clientId: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  /** When set, subscription length is day-based from startedAt (promo / daily plans). */
  dayDuration?: Maybe<Scalars['Int']['output']>;
  expiresAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastAdjustedAt?: Maybe<Scalars['String']['output']>;
  lastAdjustedById?: Maybe<Scalars['ID']['output']>;
  lastAdjustedReason?: Maybe<Scalars['String']['output']>;
  membership?: Maybe<Membership>;
  membershipId: Scalars['ID']['output'];
  /** Total months for this subscription from startedAt (matches expiry; may differ from plan default). */
  monthDuration: Scalars['Int']['output'];
  priceAtPurchase: Scalars['Float']['output'];
  startedAt: Scalars['String']['output'];
  status: TransactionStatus;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  adjustEquipmentStock: Equipment;
  approveSubscriptionRequest: MembershipTransaction;
  archiveEquipment: Equipment;
  assignCoachToGoal: Goal;
  cancelCoachRequest: Scalars['Boolean']['output'];
  cancelMembership: Scalars['Boolean']['output'];
  cancelSession: Scalars['Boolean']['output'];
  clientConfirmWeight: SessionLog;
  coachRespondToJoinRequest: Session;
  completeSession: SessionLog;
  confirmSessionCompletion: SessionLog;
  createCoachRating: CoachRating;
  createCoachRequest: CoachRequest;
  createEquipment: Equipment;
  createGoal: Goal;
  createMembership: Membership;
  createProgressRating: ProgressRating;
  createSession: Session;
  createSessionFromTemplate: Session;
  createSubscriptionRequest: SubscriptionRequest;
  createUser: AuthResponse;
  createWalkInClient: CreateWalkInClientResult;
  deleteCoachRating: Scalars['Boolean']['output'];
  deleteEquipment: Scalars['Boolean']['output'];
  deleteGoal: Scalars['Boolean']['output'];
  deleteMembership: Scalars['Boolean']['output'];
  deleteProgressRating: Scalars['Boolean']['output'];
  deleteSubscriptionRequest: Scalars['Boolean']['output'];
  deleteUser?: Maybe<Scalars['Boolean']['output']>;
  devCoachSignIn: AuthResponse;
  directSubscribeMember: MembershipTransaction;
  disableUser?: Maybe<User>;
  enableUser?: Maybe<User>;
  inviteClientsToClassSession: Session;
  leaveClassSession: Session;
  logReportDownload: ReportDownloadLog;
  login: AuthResponse;
  markAllMyNotificationsRead: Scalars['Boolean']['output'];
  markNotificationRead: Notification;
  purchaseMembership: MembershipTransaction;
  rejectSubscriptionRequest: Scalars['Boolean']['output'];
  removeClient: Scalars['Boolean']['output'];
  removeClientFromClassSession: Session;
  requestDevCoachSignInCode: Scalars['Boolean']['output'];
  requestDevEmailVerificationCode: Scalars['Boolean']['output'];
  requestToJoinClassSession: Session;
  respondToClassInvitation: Session;
  unarchiveEquipment: Equipment;
  updateCoachRating: CoachRating;
  updateCoachRequest: CoachRequest;
  updateEquipment: Equipment;
  updateGoal: Goal;
  updateMembership: Membership;
  updateMembershipTransactionDuration: MembershipTransaction;
  updateProgressRating: ProgressRating;
  updateSession: Session;
  updateUser?: Maybe<User>;
  updateWalkInClient: WalkInClient;
  updateWalkInPaymentSettings: WalkInPaymentSettings;
  walkInTimeIn: WalkInAttendanceLog;
};


export type MutationAdjustEquipmentStockArgs = {
  input: AdjustEquipmentStockInput;
};


export type MutationApproveSubscriptionRequestArgs = {
  input: ApproveSubscriptionRequestInput;
};


export type MutationArchiveEquipmentArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationAssignCoachToGoalArgs = {
  goalId: Scalars['ID']['input'];
};


export type MutationCancelCoachRequestArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCancelMembershipArgs = {
  reason: Scalars['String']['input'];
  transactionId: Scalars['ID']['input'];
};


export type MutationCancelSessionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationClientConfirmWeightArgs = {
  sessionLogId: Scalars['ID']['input'];
};


export type MutationCoachRespondToJoinRequestArgs = {
  accept: Scalars['Boolean']['input'];
  clientId: Scalars['ID']['input'];
  sessionId: Scalars['ID']['input'];
};


export type MutationCompleteSessionArgs = {
  input: CreateSessionLogInput;
};


export type MutationConfirmSessionCompletionArgs = {
  input: ConfirmSessionCompletionInput;
};


export type MutationCreateCoachRatingArgs = {
  input: CreateCoachRatingInput;
};


export type MutationCreateCoachRequestArgs = {
  input: CreateCoachRequestInput;
};


export type MutationCreateEquipmentArgs = {
  input: CreateEquipmentInput;
};


export type MutationCreateGoalArgs = {
  input: CreateGoalInput;
};


export type MutationCreateMembershipArgs = {
  input: CreateMembershipInput;
};


export type MutationCreateProgressRatingArgs = {
  input: CreateProgressRatingInput;
};


export type MutationCreateSessionArgs = {
  input: CreateSessionInput;
};


export type MutationCreateSessionFromTemplateArgs = {
  input: CreateSessionFromTemplateInput;
};


export type MutationCreateSubscriptionRequestArgs = {
  input: CreateSubscriptionRequestInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationCreateWalkInClientArgs = {
  input: CreateWalkInClientInput;
  timeInNow: Scalars['Boolean']['input'];
};


export type MutationDeleteCoachRatingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteEquipmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGoalArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMembershipArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProgressRatingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSubscriptionRequestArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDevCoachSignInArgs = {
  code: Scalars['String']['input'];
  email: Scalars['String']['input'];
};


export type MutationDirectSubscribeMemberArgs = {
  input: DirectSubscribeInput;
};


export type MutationDisableUserArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationEnableUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationInviteClientsToClassSessionArgs = {
  clientIds: Array<Scalars['ID']['input']>;
  sessionId: Scalars['ID']['input'];
};


export type MutationLeaveClassSessionArgs = {
  sessionId: Scalars['ID']['input'];
};


export type MutationLogReportDownloadArgs = {
  input: LogReportDownloadInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMarkNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPurchaseMembershipArgs = {
  input: PurchaseMembershipInput;
};


export type MutationRejectSubscriptionRequestArgs = {
  input: RejectSubscriptionRequestInput;
};


export type MutationRemoveClientArgs = {
  clientId: Scalars['ID']['input'];
};


export type MutationRemoveClientFromClassSessionArgs = {
  clientId: Scalars['ID']['input'];
  sessionId: Scalars['ID']['input'];
};


export type MutationRequestDevCoachSignInCodeArgs = {
  email: Scalars['String']['input'];
};


export type MutationRequestDevEmailVerificationCodeArgs = {
  email: Scalars['String']['input'];
};


export type MutationRequestToJoinClassSessionArgs = {
  sessionId: Scalars['ID']['input'];
};


export type MutationRespondToClassInvitationArgs = {
  accept: Scalars['Boolean']['input'];
  sessionId: Scalars['ID']['input'];
};


export type MutationUnarchiveEquipmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateCoachRatingArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  rating?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationUpdateCoachRequestArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCoachRequestInput;
};


export type MutationUpdateEquipmentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateEquipmentInput;
};


export type MutationUpdateGoalArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGoalInput;
};


export type MutationUpdateMembershipArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMembershipInput;
};


export type MutationUpdateMembershipTransactionDurationArgs = {
  input: UpdateMembershipTransactionDurationInput;
};


export type MutationUpdateProgressRatingArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProgressRatingInput;
};


export type MutationUpdateSessionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSessionInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};


export type MutationUpdateWalkInClientArgs = {
  input: UpdateWalkInClientInput;
  walkInClientId: Scalars['ID']['input'];
};


export type MutationUpdateWalkInPaymentSettingsArgs = {
  paymentPesos: Scalars['Float']['input'];
};


export type MutationWalkInTimeInArgs = {
  at?: InputMaybe<Scalars['String']['input']>;
  walkInClientId: Scalars['ID']['input'];
};

export type Notification = {
  __typename?: 'Notification';
  createdAt?: Maybe<Scalars['String']['output']>;
  dedupeKey: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  metadataJson?: Maybe<Scalars['String']['output']>;
  readAt?: Maybe<Scalars['String']['output']>;
  recipientId: Scalars['ID']['output'];
  recipientRole: RoleType;
  title: Scalars['String']['output'];
  type: NotificationType;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export enum NotificationType {
  Inactivity = 'INACTIVITY',
  MembershipExpiring = 'MEMBERSHIP_EXPIRING',
  SessionScheduled = 'SESSION_SCHEDULED'
}

export type PeriodRevenue = {
  __typename?: 'PeriodRevenue';
  count: Scalars['Int']['output'];
  period: Scalars['String']['output'];
  revenue: Scalars['Float']['output'];
  walkInCount: Scalars['Int']['output'];
  walkInRevenue: Scalars['Float']['output'];
};

export type ProgressImages = {
  __typename?: 'ProgressImages';
  back?: Maybe<Scalars['String']['output']>;
  front?: Maybe<Scalars['String']['output']>;
  leftSide?: Maybe<Scalars['String']['output']>;
  rightSide?: Maybe<Scalars['String']['output']>;
};

export type ProgressImagesInput = {
  back?: InputMaybe<Scalars['String']['input']>;
  front?: InputMaybe<Scalars['String']['input']>;
  leftSide?: InputMaybe<Scalars['String']['input']>;
  rightSide?: InputMaybe<Scalars['String']['input']>;
};

export type ProgressRating = {
  __typename?: 'ProgressRating';
  client?: Maybe<User>;
  clientId: Scalars['ID']['output'];
  coach?: Maybe<User>;
  coachId: Scalars['ID']['output'];
  comment: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  endDate: Scalars['String']['output'];
  goal?: Maybe<Goal>;
  goalId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  rating: Scalars['Int']['output'];
  sessionLogIds: Array<Scalars['ID']['output']>;
  sessionLogs?: Maybe<Array<SessionLog>>;
  startDate: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  verdict: ProgressVerdict;
};

export enum ProgressVerdict {
  Achieved = 'achieved',
  CloseToAchievement = 'close_to_achievement',
  Progressive = 'progressive',
  Regressing = 'regressing'
}

export type PurchaseMembershipInput = {
  membershipId: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  getAllClientGoals: Array<Goal>;
  getAllSubscriptionRequests: Array<SubscriptionRequest>;
  getAnalytics?: Maybe<Analytics>;
  getAnalyticsRange: Array<Analytics>;
  getAttendanceRecord?: Maybe<AttendanceRecord>;
  getAttendanceRecords: AttendanceConnection;
  getClientProgressRatings: Array<ProgressRating>;
  getClientRequests: Array<CoachRequest>;
  getClientSessions: Array<Session>;
  getCoachProgressRatings: Array<ProgressRating>;
  getCoachRatingBySessionLog?: Maybe<CoachRating>;
  getCoachRatings: Array<CoachRating>;
  getCoachRequests: Array<CoachRequest>;
  getCoachSessionLogs: Array<SessionLog>;
  getCoachSessions: Array<Session>;
  getCurrentMembership?: Maybe<MembershipTransaction>;
  getEquipment?: Maybe<Equipment>;
  getEquipments: Array<Equipment>;
  getFitnessGoalTypes: Array<Scalars['String']['output']>;
  getGoal?: Maybe<Goal>;
  getGoals: Array<Goal>;
  getJoinableGroupClasses: Array<Session>;
  getMembership?: Maybe<Membership>;
  getMembershipTransaction?: Maybe<MembershipTransaction>;
  getMemberships: Array<Membership>;
  getMyNotifications: Array<Notification>;
  getMySubscriptionRequests: Array<SubscriptionRequest>;
  getPendingCoachRequests: Array<CoachRequest>;
  getPendingSubscriptionRequests: Array<SubscriptionRequest>;
  getProgressRatings: Array<ProgressRating>;
  getReportDownloadLogs: Array<ReportDownloadLog>;
  getRevenueSummary: RevenueSummary;
  getSession?: Maybe<Session>;
  getSessionLogBySessionId?: Maybe<SessionLog>;
  getSessionLogs: Array<SessionLog>;
  getSessionLogsForRating: Array<SessionLog>;
  getSessionTemplates: Array<Session>;
  getSubscriptionRequest?: Maybe<SubscriptionRequest>;
  getUpcomingSessions: Array<Session>;
  getUser?: Maybe<User>;
  getUsers?: Maybe<Array<Maybe<User>>>;
  getWeightProgress: Array<SessionLog>;
  getWeightProgressChart: Array<WeightProgress>;
  /** Current user from Authorization (JWT or Clerk session token). */
  me?: Maybe<User>;
  /** Search by name/phone/email, or pass an empty query to list all walk-ins (admin, paginated). */
  searchWalkInClients: Array<WalkInClient>;
  /** All walk-in profiles with per-profile time-in counts (paginated, newest updated first). */
  walkInAccountsOverview: WalkInAccountsOverview;
  walkInAttendanceLogs: WalkInLogsConnection;
  /** All time-in logs for one walk-in client (newest first). */
  walkInLogsByClient: WalkInLogsConnection;
  /** Default walk-in time-in fee in PHP (admin). */
  walkInPaymentSettings: WalkInPaymentSettings;
  /** System-wide walk-in profile and time-in counts (admin). */
  walkInStats: WalkInStats;
};


export type QueryGetAllClientGoalsArgs = {
  coachId: Scalars['ID']['input'];
  status?: InputMaybe<GoalStatus>;
};


export type QueryGetAnalyticsArgs = {
  date: Scalars['String']['input'];
};


export type QueryGetAnalyticsRangeArgs = {
  dateRange: DateRangeInput;
};


export type QueryGetAttendanceRecordArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetAttendanceRecordsArgs = {
  filter?: InputMaybe<AttendanceFilter>;
  pagination?: InputMaybe<AttendancePagination>;
};


export type QueryGetClientProgressRatingsArgs = {
  clientId: Scalars['ID']['input'];
};


export type QueryGetClientRequestsArgs = {
  clientId: Scalars['ID']['input'];
  status?: InputMaybe<CoachRequestStatus>;
};


export type QueryGetClientSessionsArgs = {
  clientId: Scalars['ID']['input'];
  status?: InputMaybe<SessionStatus>;
};


export type QueryGetCoachProgressRatingsArgs = {
  coachId: Scalars['ID']['input'];
};


export type QueryGetCoachRatingBySessionLogArgs = {
  sessionLogId: Scalars['ID']['input'];
};


export type QueryGetCoachRatingsArgs = {
  coachId: Scalars['ID']['input'];
};


export type QueryGetCoachRequestsArgs = {
  coachId: Scalars['ID']['input'];
  status?: InputMaybe<CoachRequestStatus>;
};


export type QueryGetCoachSessionLogsArgs = {
  coachId: Scalars['ID']['input'];
};


export type QueryGetCoachSessionsArgs = {
  coachId: Scalars['ID']['input'];
  status?: InputMaybe<SessionStatus>;
};


export type QueryGetEquipmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetEquipmentsArgs = {
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetGoalArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetGoalsArgs = {
  clientId: Scalars['ID']['input'];
  status?: InputMaybe<GoalStatus>;
};


export type QueryGetMembershipArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetMembershipTransactionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetMembershipsArgs = {
  status?: InputMaybe<MembershipStatus>;
};


export type QueryGetMyNotificationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetProgressRatingsArgs = {
  clientId: Scalars['ID']['input'];
  goalId: Scalars['ID']['input'];
};


export type QueryGetReportDownloadLogsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  reportType?: InputMaybe<ReportType>;
};


export type QueryGetRevenueSummaryArgs = {
  dateRange?: InputMaybe<DateRangeInput>;
};


export type QueryGetSessionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetSessionLogBySessionIdArgs = {
  sessionId: Scalars['ID']['input'];
};


export type QueryGetSessionLogsArgs = {
  clientId: Scalars['ID']['input'];
};


export type QueryGetSessionLogsForRatingArgs = {
  clientId: Scalars['ID']['input'];
  endDate: Scalars['String']['input'];
  goalId: Scalars['ID']['input'];
  startDate: Scalars['String']['input'];
};


export type QueryGetSessionTemplatesArgs = {
  coachId: Scalars['ID']['input'];
};


export type QueryGetSubscriptionRequestArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetUsersArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<RoleType>;
};


export type QueryGetWeightProgressArgs = {
  clientId: Scalars['ID']['input'];
  goalId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryGetWeightProgressChartArgs = {
  clientId: Scalars['ID']['input'];
  goalId?: InputMaybe<Scalars['ID']['input']>;
};


export type QuerySearchWalkInClientsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWalkInAccountsOverviewArgs = {
  pagination?: InputMaybe<WalkInPagination>;
};


export type QueryWalkInAttendanceLogsArgs = {
  filter: WalkInLogsFilter;
  pagination?: InputMaybe<WalkInPagination>;
};


export type QueryWalkInLogsByClientArgs = {
  pagination?: InputMaybe<WalkInPagination>;
  walkInClientId: Scalars['ID']['input'];
};

export type RejectSubscriptionRequestInput = {
  requestId: Scalars['ID']['input'];
};

export type ReportDownloadDateRange = {
  __typename?: 'ReportDownloadDateRange';
  endDate?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
};

export type ReportDownloadDateRangeInput = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type ReportDownloadLog = {
  __typename?: 'ReportDownloadLog';
  createdAt?: Maybe<Scalars['String']['output']>;
  dateRange?: Maybe<ReportDownloadDateRange>;
  downloadedBy?: Maybe<User>;
  downloadedById: Scalars['ID']['output'];
  downloadedByRole: RoleType;
  fileName?: Maybe<Scalars['String']['output']>;
  filterSummary?: Maybe<Scalars['String']['output']>;
  format: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  metadataJson?: Maybe<Scalars['String']['output']>;
  reportType: ReportType;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export enum ReportType {
  Attendance = 'ATTENDANCE',
  Equipment = 'EQUIPMENT',
  NearEndingMemberships = 'NEAR_ENDING_MEMBERSHIPS',
  Revenue = 'REVENUE',
  WalkIn = 'WALK_IN'
}

export type RevenueSummary = {
  __typename?: 'RevenueSummary';
  activeSubscriptions: Scalars['Int']['output'];
  canceledSubscriptions: Scalars['Int']['output'];
  expiredSubscriptions: Scalars['Int']['output'];
  membershipSubscriptionRevenue: Scalars['Float']['output'];
  newSubscriptions: Scalars['Int']['output'];
  revenueByMembership: Array<MembershipRevenue>;
  revenueByPeriod: Array<PeriodRevenue>;
  totalRevenue: Scalars['Float']['output'];
  walkInRevenue: Scalars['Float']['output'];
};

export enum RoleType {
  Admin = 'admin',
  Coach = 'coach',
  Member = 'member'
}

export type Session = {
  __typename?: 'Session';
  clients?: Maybe<Array<User>>;
  clientsIds: Array<Scalars['ID']['output']>;
  coach?: Maybe<User>;
  coachId: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  date: Scalars['String']['output'];
  endTime?: Maybe<Scalars['String']['output']>;
  enrollments: Array<ClassEnrollment>;
  goal?: Maybe<Goal>;
  goalId?: Maybe<Scalars['ID']['output']>;
  gymArea: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isTemplate?: Maybe<Scalars['Boolean']['output']>;
  maxParticipants?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  sessionKind: SessionKind;
  startTime: Scalars['String']['output'];
  status: SessionStatus;
  templateId?: Maybe<Scalars['ID']['output']>;
  time?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  workoutType?: Maybe<Scalars['String']['output']>;
};

export enum SessionKind {
  GroupClass = 'group_class',
  Personal = 'personal'
}

export type SessionLog = {
  __typename?: 'SessionLog';
  client?: Maybe<User>;
  clientConfirmed: Scalars['Boolean']['output'];
  clientId: Scalars['ID']['output'];
  coach?: Maybe<User>;
  coachConfirmed: Scalars['Boolean']['output'];
  coachId: Scalars['ID']['output'];
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  progressImages?: Maybe<ProgressImages>;
  session?: Maybe<Session>;
  sessionId: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  weight?: Maybe<Scalars['Float']['output']>;
};

export enum SessionStatus {
  Cancelled = 'cancelled',
  Completed = 'completed',
  Scheduled = 'scheduled'
}

export type Subscription = {
  __typename?: 'Subscription';
  _empty?: Maybe<Scalars['Boolean']['output']>;
  attendanceRecordAdded: AttendanceRecord;
  attendanceUpdated: Array<AttendanceRecord>;
  membershipsUpdated: Array<Membership>;
  revenueSummaryUpdated: RevenueSummary;
  usersUpdated: Array<User>;
};


export type SubscriptionRevenueSummaryUpdatedArgs = {
  dateRange?: InputMaybe<DateRangeInput>;
};


export type SubscriptionUsersUpdatedArgs = {
  role?: InputMaybe<RoleType>;
};

export type SubscriptionRequest = {
  __typename?: 'SubscriptionRequest';
  approvedAt?: Maybe<Scalars['String']['output']>;
  approvedBy?: Maybe<User>;
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  member?: Maybe<User>;
  memberId: Scalars['ID']['output'];
  membership?: Maybe<Membership>;
  membershipId: Scalars['ID']['output'];
  rejectedAt?: Maybe<Scalars['String']['output']>;
  rejectedBy?: Maybe<User>;
  requestedAt: Scalars['String']['output'];
  status: SubscriptionRequestStatus;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export enum SubscriptionRequestStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export enum TransactionStatus {
  Active = 'ACTIVE',
  Canceled = 'CANCELED',
  Expired = 'EXPIRED'
}

export type UpdateCoachRequestInput = {
  status: CoachRequestStatus;
};

export type UpdateEquipmentInput = {
  acquiredAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  maintenanceStartedAt?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<EquipmentStatus>;
};

export type UpdateGoalInput = {
  currentWeight?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  goalType?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<GoalStatus>;
  targetDate?: InputMaybe<Scalars['String']['input']>;
  targetWeight?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMembershipInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  durationType?: InputMaybe<DurationType>;
  features?: InputMaybe<Array<Scalars['String']['input']>>;
  monthDuration?: InputMaybe<Scalars['Int']['input']>;
  monthlyPrice?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<MembershipStatus>;
  statusEffectiveAt?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMembershipTransactionDurationInput = {
  /** New total calendar days from startedAt (recalculates expiresAt). Omit when using monthDuration. */
  dayDuration?: InputMaybe<Scalars['Int']['input']>;
  /** New total months from the transaction's startedAt (recalculates expiresAt). Omit when using dayDuration. */
  monthDuration?: InputMaybe<Scalars['Int']['input']>;
  /** Required audit reason for changing length/start date. */
  reason: Scalars['String']['input'];
  /** Optional ISO 8601 start datetime. When set, replaces the transaction startedAt and recalculates expiresAt from it (walk-ins / legacy corrections). Omit to keep the existing start date. */
  startedAt?: InputMaybe<Scalars['String']['input']>;
  transactionId: Scalars['ID']['input'];
};

export type UpdateProgressRatingInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['Int']['input']>;
  sessionLogIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  verdict?: InputMaybe<ProgressVerdict>;
};

export type UpdateSessionInput = {
  date?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  gymArea?: InputMaybe<Scalars['String']['input']>;
  maxParticipants?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<SessionStatus>;
  workoutType?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  agreedToLiabilityWaiver?: InputMaybe<Scalars['Boolean']['input']>;
  agreedToPrivacyPolicy?: InputMaybe<Scalars['Boolean']['input']>;
  agreedToTermsAndConditions?: InputMaybe<Scalars['Boolean']['input']>;
  coachDetails?: InputMaybe<CoachDetailsInput>;
  currentPassword?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  guardianIdVerificationPhotoUrl?: InputMaybe<Scalars['String']['input']>;
  heardFrom?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  membershipDetails?: InputMaybe<MemberDetailsInput>;
  middleName?: InputMaybe<Scalars['String']['input']>;
  minorLiabilityWaiverPrintedName?: InputMaybe<Scalars['String']['input']>;
  minorLiabilityWaiverSignatureUrl?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWalkInClientInput = {
  ageYears: Scalars['Int']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  gender: WalkInGender;
  lastName: Scalars['String']['input'];
  middleName?: InputMaybe<Scalars['String']['input']>;
  minorWaiverAcknowledged?: InputMaybe<Scalars['Boolean']['input']>;
  minorWaiverGuardianName?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  agreedToLiabilityWaiver?: Maybe<Scalars['Boolean']['output']>;
  agreedToPrivacyPolicy?: Maybe<Scalars['Boolean']['output']>;
  agreedToTermsAndConditions?: Maybe<Scalars['Boolean']['output']>;
  attendanceId?: Maybe<Scalars['Int']['output']>;
  coachDetails?: Maybe<CoachDetails>;
  createdAt?: Maybe<Scalars['String']['output']>;
  currentMembership?: Maybe<MembershipTransaction>;
  dateOfBirth?: Maybe<Scalars['String']['output']>;
  disableReason?: Maybe<Scalars['String']['output']>;
  disabledAt?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  gender: Scalars['String']['output'];
  guardianIdVerificationPhotoUrl?: Maybe<Scalars['String']['output']>;
  heardFrom?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  id: Scalars['ID']['output'];
  isDisabled: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  loginHistory?: Maybe<Array<Maybe<LoginHistoryEntry>>>;
  membershipDetails?: Maybe<MemberDetails>;
  middleName?: Maybe<Scalars['String']['output']>;
  minorLiabilityWaiverPrintedName?: Maybe<Scalars['String']['output']>;
  minorLiabilityWaiverSignatureUrl?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  role: RoleType;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type WalkInAccountRow = {
  __typename?: 'WalkInAccountRow';
  client: WalkInClient;
  /** Total number of time-in attendance records for this walk-in profile. */
  timeInCount: Scalars['Int']['output'];
};

export type WalkInAccountsOverview = {
  __typename?: 'WalkInAccountsOverview';
  rows: Array<WalkInAccountRow>;
  /** Total time-in log rows across all walk-ins. */
  totalTimeInRecords: Scalars['Int']['output'];
  /** Total walk-in profiles in the system. */
  totalWalkInAccounts: Scalars['Int']['output'];
};

export type WalkInAttendanceLog = {
  __typename?: 'WalkInAttendanceLog';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  localDate: Scalars['String']['output'];
  /** Walk-in fee (PHP) recorded at time-in. */
  payment: Scalars['Float']['output'];
  timedInAt: Scalars['String']['output'];
  walkInClient: WalkInClient;
};

export type WalkInClient = {
  __typename?: 'WalkInClient';
  /** Age in whole years (admin-entered). */
  ageYears?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  gender: WalkInGender;
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  middleName?: Maybe<Scalars['String']['output']>;
  /** When the guardian liability waiver was recorded (ISO). */
  minorWaiverAcceptedAt?: Maybe<Scalars['String']['output']>;
  /** Parent/guardian name on file when under 18 with waiver. */
  minorWaiverGuardianName?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export enum WalkInGender {
  Female = 'FEMALE',
  Male = 'MALE',
  NonBinary = 'NON_BINARY',
  PreferNotToSay = 'PREFER_NOT_TO_SAY'
}

export type WalkInLogsConnection = {
  __typename?: 'WalkInLogsConnection';
  logs: Array<WalkInAttendanceLog>;
  totalCount: Scalars['Int']['output'];
};

export type WalkInLogsFilter = {
  /** YYYY-MM-DD (Asia/Manila calendar date) */
  date: Scalars['String']['input'];
};

export type WalkInPagination = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type WalkInPaymentSettings = {
  __typename?: 'WalkInPaymentSettings';
  /** Default PHP amount applied to each new time-in (admin-configurable). */
  defaultPaymentPesos: Scalars['Float']['output'];
};

export type WalkInStats = {
  __typename?: 'WalkInStats';
  totalTimeInRecords: Scalars['Int']['output'];
  totalWalkInAccounts: Scalars['Int']['output'];
};

export type WeightProgress = {
  __typename?: 'WeightProgress';
  date: Scalars['String']['output'];
  sessionId?: Maybe<Scalars['ID']['output']>;
  sessionLogId?: Maybe<Scalars['ID']['output']>;
  weight: Scalars['Float']['output'];
};

export type GetEquipmentsQueryVariables = Exact<{
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetEquipmentsQuery = { __typename?: 'Query', getEquipments: Array<{ __typename?: 'Equipment', id: string, name: string, imageUrl: string, description?: string | null, notes?: string | null, acquiredAt?: string | null, sortOrder: number, status: EquipmentStatus, quantity: number, maintenanceStartedAt?: string | null, isArchived: boolean, archivedAt?: string | null, archiveReason?: string | null, createdAt?: string | null, updatedAt?: string | null, lifecycleLogs: Array<{ __typename?: 'EquipmentLifecycleLog', action: string, notes?: string | null, status?: EquipmentStatus | null, changedAt: string, changedById?: string | null }> }> };

export type GetEquipmentsLegacyQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEquipmentsLegacyQuery = { __typename?: 'Query', getEquipments: Array<{ __typename?: 'Equipment', id: string, name: string, imageUrl: string, description?: string | null, notes?: string | null, sortOrder: number, status: EquipmentStatus, createdAt?: string | null, updatedAt?: string | null }> };

export type GetEquipmentQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetEquipmentQuery = { __typename?: 'Query', getEquipment?: { __typename?: 'Equipment', id: string, name: string, imageUrl: string, description?: string | null, notes?: string | null, acquiredAt?: string | null, sortOrder: number, status: EquipmentStatus, quantity: number, maintenanceStartedAt?: string | null, isArchived: boolean, archivedAt?: string | null, archiveReason?: string | null, createdAt?: string | null, updatedAt?: string | null, lifecycleLogs: Array<{ __typename?: 'EquipmentLifecycleLog', action: string, notes?: string | null, status?: EquipmentStatus | null, changedAt: string, changedById?: string | null }> } | null };

export type CreateEquipmentMutationVariables = Exact<{
  input: CreateEquipmentInput;
}>;


export type CreateEquipmentMutation = { __typename?: 'Mutation', createEquipment: { __typename?: 'Equipment', id: string, name: string, imageUrl: string, description?: string | null, notes?: string | null, acquiredAt?: string | null, sortOrder: number, status: EquipmentStatus, quantity: number, maintenanceStartedAt?: string | null, isArchived: boolean, archivedAt?: string | null, archiveReason?: string | null, createdAt?: string | null, updatedAt?: string | null, lifecycleLogs: Array<{ __typename?: 'EquipmentLifecycleLog', action: string, notes?: string | null, status?: EquipmentStatus | null, changedAt: string, changedById?: string | null }> } };

export type CreateEquipmentLegacyMutationVariables = Exact<{
  input: CreateEquipmentInput;
}>;


export type CreateEquipmentLegacyMutation = { __typename?: 'Mutation', createEquipment: { __typename?: 'Equipment', id: string, name: string, imageUrl: string, description?: string | null, notes?: string | null, sortOrder: number, status: EquipmentStatus, quantity: number, maintenanceStartedAt?: string | null, createdAt?: string | null, updatedAt?: string | null } };

export type UpdateEquipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateEquipmentInput;
}>;


export type UpdateEquipmentMutation = { __typename?: 'Mutation', updateEquipment: { __typename?: 'Equipment', id: string, name: string, imageUrl: string, description?: string | null, notes?: string | null, acquiredAt?: string | null, sortOrder: number, status: EquipmentStatus, isArchived: boolean, archivedAt?: string | null, archiveReason?: string | null, createdAt?: string | null, updatedAt?: string | null, lifecycleLogs: Array<{ __typename?: 'EquipmentLifecycleLog', action: string, notes?: string | null, status?: EquipmentStatus | null, changedAt: string, changedById?: string | null }> } };

export type UpdateEquipmentLegacyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateEquipmentInput;
}>;


export type UpdateEquipmentLegacyMutation = { __typename?: 'Mutation', updateEquipment: { __typename?: 'Equipment', id: string, name: string, imageUrl: string, description?: string | null, notes?: string | null, sortOrder: number, status: EquipmentStatus, quantity: number, maintenanceStartedAt?: string | null, createdAt?: string | null, updatedAt?: string | null } };

export type AdjustEquipmentStockMutationVariables = Exact<{
  input: AdjustEquipmentStockInput;
}>;


export type AdjustEquipmentStockMutation = { __typename?: 'Mutation', adjustEquipmentStock: { __typename?: 'Equipment', id: string, quantity: number, status: EquipmentStatus, maintenanceStartedAt?: string | null, updatedAt?: string | null } };

export type ArchiveEquipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type ArchiveEquipmentMutation = { __typename?: 'Mutation', archiveEquipment: { __typename?: 'Equipment', id: string, isArchived: boolean, archivedAt?: string | null, archiveReason?: string | null, updatedAt?: string | null, lifecycleLogs: Array<{ __typename?: 'EquipmentLifecycleLog', action: string, notes?: string | null, status?: EquipmentStatus | null, changedAt: string, changedById?: string | null }> } };

export type UnarchiveEquipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UnarchiveEquipmentMutation = { __typename?: 'Mutation', unarchiveEquipment: { __typename?: 'Equipment', id: string, isArchived: boolean, archivedAt?: string | null, archiveReason?: string | null, updatedAt?: string | null, lifecycleLogs: Array<{ __typename?: 'EquipmentLifecycleLog', action: string, notes?: string | null, status?: EquipmentStatus | null, changedAt: string, changedById?: string | null }> } };

export type DeleteEquipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteEquipmentMutation = { __typename?: 'Mutation', deleteEquipment: boolean };

export type GetRevenueSummaryQueryVariables = Exact<{
  dateRange?: InputMaybe<DateRangeInput>;
}>;


export type GetRevenueSummaryQuery = { __typename?: 'Query', getRevenueSummary: { __typename?: 'RevenueSummary', totalRevenue: number, membershipSubscriptionRevenue: number, walkInRevenue: number, activeSubscriptions: number, newSubscriptions: number, canceledSubscriptions: number, expiredSubscriptions: number, revenueByMembership: Array<{ __typename?: 'MembershipRevenue', membershipId: string, membershipName: string, revenue: number, count: number }>, revenueByPeriod: Array<{ __typename?: 'PeriodRevenue', period: string, revenue: number, count: number, walkInRevenue: number, walkInCount: number }> } };

export type GetAnalyticsQueryVariables = Exact<{
  date: Scalars['String']['input'];
}>;


export type GetAnalyticsQuery = { __typename?: 'Query', getAnalytics?: { __typename?: 'Analytics', id: string, date: string, totalRevenue: number, membershipSubscriptionRevenue: number, walkInRevenue: number, activeSubscriptions: number, newSubscriptions: number, canceledSubscriptions: number, expiredSubscriptions: number, createdAt?: string | null, updatedAt?: string | null, revenueByMembership: Array<{ __typename?: 'MembershipRevenue', membershipId: string, membershipName: string, revenue: number, count: number }> } | null };

export type GetAnalyticsRangeQueryVariables = Exact<{
  dateRange: DateRangeInput;
}>;


export type GetAnalyticsRangeQuery = { __typename?: 'Query', getAnalyticsRange: Array<{ __typename?: 'Analytics', id: string, date: string, totalRevenue: number, membershipSubscriptionRevenue: number, walkInRevenue: number, activeSubscriptions: number, newSubscriptions: number, canceledSubscriptions: number, expiredSubscriptions: number, createdAt?: string | null, updatedAt?: string | null, revenueByMembership: Array<{ __typename?: 'MembershipRevenue', membershipId: string, membershipName: string, revenue: number, count: number }> }> };

export type RevenueSummaryUpdatedSubscriptionVariables = Exact<{
  dateRange?: InputMaybe<DateRangeInput>;
}>;


export type RevenueSummaryUpdatedSubscription = { __typename?: 'Subscription', revenueSummaryUpdated: { __typename?: 'RevenueSummary', totalRevenue: number, membershipSubscriptionRevenue: number, walkInRevenue: number, activeSubscriptions: number, newSubscriptions: number, canceledSubscriptions: number, expiredSubscriptions: number, revenueByMembership: Array<{ __typename?: 'MembershipRevenue', membershipId: string, membershipName: string, revenue: number, count: number }>, revenueByPeriod: Array<{ __typename?: 'PeriodRevenue', period: string, revenue: number, count: number, walkInRevenue: number, walkInCount: number }> } };

export type GetAttendanceRecordsQueryVariables = Exact<{
  filter?: InputMaybe<AttendanceFilter>;
  pagination?: InputMaybe<AttendancePagination>;
}>;


export type GetAttendanceRecordsQuery = { __typename?: 'Query', getAttendanceRecords: { __typename?: 'AttendanceConnection', totalCount: number, hasMore: boolean, records: Array<{ __typename?: 'AttendanceRecord', id: string, authDateTime: string, authDate: string, authTime: string, direction: string, deviceName: string, deviceSerNum: string, personName: string, cardNo?: string | null }> } };

export type GetAttendanceRecordQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetAttendanceRecordQuery = { __typename?: 'Query', getAttendanceRecord?: { __typename?: 'AttendanceRecord', id: string, authDateTime: string, authDate: string, authTime: string, direction: string, deviceName: string, deviceSerNum: string, personName: string, cardNo?: string | null } | null };

export type AttendanceRecordAddedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AttendanceRecordAddedSubscription = { __typename?: 'Subscription', attendanceRecordAdded: { __typename?: 'AttendanceRecord', id: string, authDateTime: string, authDate: string, authTime: string, direction: string, deviceName: string, deviceSerNum: string, personName: string, cardNo?: string | null } };

export type AttendanceUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AttendanceUpdatedSubscription = { __typename?: 'Subscription', attendanceUpdated: Array<{ __typename?: 'AttendanceRecord', id: string, authDateTime: string, authDate: string, authTime: string, direction: string, deviceName: string, deviceSerNum: string, personName: string, cardNo?: string | null }> };

export type GetReportDownloadLogsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  reportType?: InputMaybe<ReportType>;
}>;


export type GetReportDownloadLogsQuery = { __typename?: 'Query', getReportDownloadLogs: Array<{ __typename?: 'ReportDownloadLog', id: string, reportType: ReportType, format: string, downloadedById: string, downloadedByRole: RoleType, fileName?: string | null, filterSummary?: string | null, metadataJson?: string | null, createdAt?: string | null, downloadedBy?: { __typename?: 'User', id: string, firstName: string, lastName: string, email: string } | null, dateRange?: { __typename?: 'ReportDownloadDateRange', startDate?: string | null, endDate?: string | null } | null }> };

export type LogReportDownloadMutationVariables = Exact<{
  input: LogReportDownloadInput;
}>;


export type LogReportDownloadMutation = { __typename?: 'Mutation', logReportDownload: { __typename?: 'ReportDownloadLog', id: string, reportType: ReportType, format: string, downloadedById: string, createdAt?: string | null } };

export type GetGoalsForClientQueryVariables = Exact<{
  clientId: Scalars['ID']['input'];
  status?: InputMaybe<GoalStatus>;
}>;


export type GetGoalsForClientQuery = { __typename?: 'Query', getGoals: Array<{ __typename?: 'Goal', id: string, clientId: string, title: string, goalType: string, status: GoalStatus }> };

export type GetAllMembershipsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllMembershipsQuery = { __typename?: 'Query', getMemberships: Array<{ __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, statusEffectiveAt?: string | null, durationType: DurationType, monthDuration: number, createdAt?: string | null, updatedAt?: string | null }> };

export type GetActiveMembershipsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveMembershipsQuery = { __typename?: 'Query', getMemberships: Array<{ __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, statusEffectiveAt?: string | null, durationType: DurationType, monthDuration: number, createdAt?: string | null, updatedAt?: string | null }> };

export type GetCurrentMembershipQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentMembershipQuery = { __typename?: 'Query', getCurrentMembership?: { __typename?: 'MembershipTransaction', id: string, clientId: string, membershipId: string, priceAtPurchase: number, startedAt: string, expiresAt: string, monthDuration: number, status: TransactionStatus, createdAt?: string | null, updatedAt?: string | null, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, durationType: DurationType, monthDuration: number } | null } | null };

export type DirectSubscribeMemberMutationVariables = Exact<{
  input: DirectSubscribeInput;
}>;


export type DirectSubscribeMemberMutation = { __typename?: 'Mutation', directSubscribeMember: { __typename?: 'MembershipTransaction', id: string, clientId: string, membershipId: string, priceAtPurchase: number, startedAt: string, expiresAt: string, monthDuration: number, dayDuration?: number | null, status: TransactionStatus, createdAt?: string | null, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number } | null } };

export type UpdateMembershipTransactionDurationMutationVariables = Exact<{
  input: UpdateMembershipTransactionDurationInput;
}>;


export type UpdateMembershipTransactionDurationMutation = { __typename?: 'Mutation', updateMembershipTransactionDuration: { __typename?: 'MembershipTransaction', id: string, clientId: string, membershipId: string, priceAtPurchase: number, startedAt: string, expiresAt: string, monthDuration: number, dayDuration?: number | null, lastAdjustedReason?: string | null, lastAdjustedAt?: string | null, status: TransactionStatus, createdAt?: string | null, updatedAt?: string | null, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number } | null } };

export type MembershipsUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type MembershipsUpdatedSubscription = { __typename?: 'Subscription', membershipsUpdated: Array<{ __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, statusEffectiveAt?: string | null, durationType: DurationType, monthDuration: number, createdAt?: string | null, updatedAt?: string | null }> };

export type GetMyNotificationsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetMyNotificationsQuery = { __typename?: 'Query', getMyNotifications: Array<{ __typename?: 'Notification', id: string, recipientId: string, recipientRole: RoleType, type: NotificationType, title: string, message: string, dedupeKey: string, metadataJson?: string | null, isRead: boolean, readAt?: string | null, createdAt?: string | null, updatedAt?: string | null }> };

export type MarkNotificationReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkNotificationReadMutation = { __typename?: 'Mutation', markNotificationRead: { __typename?: 'Notification', id: string, isRead: boolean, readAt?: string | null } };

export type MarkAllMyNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllMyNotificationsReadMutation = { __typename?: 'Mutation', markAllMyNotificationsRead: boolean };

export type GetCoachSessionsQueryVariables = Exact<{
  coachId: Scalars['ID']['input'];
  status?: InputMaybe<SessionStatus>;
}>;


export type GetCoachSessionsQuery = { __typename?: 'Query', getCoachSessions: Array<{ __typename?: 'Session', id: string, coachId: string, clientsIds: Array<string>, name: string, date: string, startTime: string, endTime?: string | null, gymArea: string, status: SessionStatus, note?: string | null, sessionKind: SessionKind, maxParticipants?: number | null, createdAt?: string | null, updatedAt?: string | null, clients?: Array<{ __typename?: 'User', id: string, firstName: string, lastName: string, email: string }> | null, enrollments: Array<{ __typename?: 'ClassEnrollment', clientId: string, status: ClassEnrollmentStatus, createdAt?: string | null, client?: { __typename?: 'User', id: string, firstName: string, lastName: string, email: string } | null }> }> };

export type CreateSessionMutationVariables = Exact<{
  input: CreateSessionInput;
}>;


export type CreateSessionMutation = { __typename?: 'Mutation', createSession: { __typename?: 'Session', id: string, coachId: string, clientsIds: Array<string>, name: string, date: string, startTime: string, endTime?: string | null, gymArea: string, note?: string | null, status: SessionStatus, sessionKind: SessionKind, maxParticipants?: number | null, goalId?: string | null } };

export type GetCoachSessionLogsQueryVariables = Exact<{
  coachId: Scalars['ID']['input'];
}>;


export type GetCoachSessionLogsQuery = { __typename?: 'Query', getCoachSessionLogs: Array<{ __typename?: 'SessionLog', id: string, sessionId: string, coachId: string, clientId: string, weight?: number | null, notes?: string | null, completedAt?: string | null, createdAt?: string | null, updatedAt?: string | null, client?: { __typename?: 'User', id: string, firstName: string, lastName: string, email: string } | null, session?: { __typename?: 'Session', id: string, name: string, date: string, startTime: string, endTime?: string | null, status: SessionStatus } | null }> };

export type GetPendingSubscriptionRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPendingSubscriptionRequestsQuery = { __typename?: 'Query', getPendingSubscriptionRequests: Array<{ __typename?: 'SubscriptionRequest', id: string, memberId: string, membershipId: string, status: SubscriptionRequestStatus, requestedAt: string, createdAt?: string | null, updatedAt?: string | null, member?: { __typename?: 'User', id: string, firstName: string, lastName: string, email: string } | null, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, durationType: DurationType, monthDuration: number } | null }> };

export type GetAllSubscriptionRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllSubscriptionRequestsQuery = { __typename?: 'Query', getAllSubscriptionRequests: Array<{ __typename?: 'SubscriptionRequest', id: string, memberId: string, membershipId: string, status: SubscriptionRequestStatus, requestedAt: string, approvedAt?: string | null, rejectedAt?: string | null, createdAt?: string | null, updatedAt?: string | null, member?: { __typename?: 'User', id: string, firstName: string, lastName: string, email: string } | null, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, durationType: DurationType, monthDuration: number } | null, approvedBy?: { __typename?: 'User', id: string, firstName: string, lastName: string, email: string } | null, rejectedBy?: { __typename?: 'User', id: string, firstName: string, lastName: string, email: string } | null }> };

export type ApproveSubscriptionRequestMutationVariables = Exact<{
  input: ApproveSubscriptionRequestInput;
}>;


export type ApproveSubscriptionRequestMutation = { __typename?: 'Mutation', approveSubscriptionRequest: { __typename?: 'MembershipTransaction', id: string, clientId: string, priceAtPurchase: number, startedAt: string, expiresAt: string, status: TransactionStatus, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number } | null } };

export type RejectSubscriptionRequestMutationVariables = Exact<{
  input: RejectSubscriptionRequestInput;
}>;


export type RejectSubscriptionRequestMutation = { __typename?: 'Mutation', rejectSubscriptionRequest: boolean };

export type DeleteSubscriptionRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteSubscriptionRequestMutation = { __typename?: 'Mutation', deleteSubscriptionRequest: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, firstName: string, middleName?: string | null, lastName: string, email: string, role: RoleType, phoneNumber?: string | null, dateOfBirth?: string | null, gender: string } | null };

export type GetUsersQueryVariables = Exact<{
  role?: InputMaybe<RoleType>;
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetUsersQuery = { __typename?: 'Query', getUsers?: Array<{ __typename?: 'User', id: string, firstName: string, middleName?: string | null, lastName: string, email: string, role: RoleType, phoneNumber?: string | null, dateOfBirth?: string | null, gender: string, heardFrom?: Array<string | null> | null, attendanceId?: number | null, isDisabled: boolean, disabledAt?: string | null, disableReason?: string | null, createdAt?: string | null, updatedAt?: string | null, membershipDetails?: { __typename?: 'MemberDetails', membershipId?: string | null, physiqueGoalType: string, fitnessGoal?: Array<string> | null, workOutTime?: Array<string | null> | null, coachesIds?: Array<string | null> | null, hasEnteredDetails?: boolean | null, facilityBiometricEnrollmentComplete?: boolean | null, membershipTransaction?: { __typename?: 'MembershipTransaction', id: string, membershipId: string, priceAtPurchase: number, startedAt: string, expiresAt: string, monthDuration: number, dayDuration?: number | null, status: TransactionStatus, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, durationType: DurationType, monthDuration: number } | null } | null } | null, currentMembership?: { __typename?: 'MembershipTransaction', id: string, membershipId: string, priceAtPurchase: number, startedAt: string, expiresAt: string, monthDuration: number, dayDuration?: number | null, status: TransactionStatus, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, durationType: DurationType, monthDuration: number } | null } | null, coachDetails?: { __typename?: 'CoachDetails', clientsIds?: Array<string | null> | null, sessionsIds?: Array<string | null> | null, specialization?: Array<string> | null, ratings?: number | null, yearsOfExperience?: number | null, moreDetails?: string | null, teachingDate?: Array<string | null> | null, teachingTime?: Array<string | null> | null, clientLimit?: number | null } | null, loginHistory?: Array<{ __typename?: 'LoginHistoryEntry', ipAddress?: string | null, userAgent?: string | null, loginAt?: string | null } | null> | null } | null> | null };

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', getUser?: { __typename?: 'User', id: string, firstName: string, middleName?: string | null, lastName: string, email: string, role: RoleType, phoneNumber?: string | null, dateOfBirth?: string | null, gender: string, heardFrom?: Array<string | null> | null, attendanceId?: number | null, isDisabled: boolean, disabledAt?: string | null, disableReason?: string | null, createdAt?: string | null, updatedAt?: string | null, membershipDetails?: { __typename?: 'MemberDetails', membershipId?: string | null, physiqueGoalType: string, fitnessGoal?: Array<string> | null, workOutTime?: Array<string | null> | null, coachesIds?: Array<string | null> | null, hasEnteredDetails?: boolean | null, facilityBiometricEnrollmentComplete?: boolean | null, membershipTransaction?: { __typename?: 'MembershipTransaction', id: string, membershipId: string, priceAtPurchase: number, startedAt: string, expiresAt: string, monthDuration: number, dayDuration?: number | null, status: TransactionStatus, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, durationType: DurationType, monthDuration: number } | null } | null } | null, currentMembership?: { __typename?: 'MembershipTransaction', id: string, membershipId: string, priceAtPurchase: number, startedAt: string, expiresAt: string, monthDuration: number, dayDuration?: number | null, status: TransactionStatus, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, durationType: DurationType, monthDuration: number } | null } | null, coachDetails?: { __typename?: 'CoachDetails', clientsIds?: Array<string | null> | null, sessionsIds?: Array<string | null> | null, specialization?: Array<string> | null, ratings?: number | null, yearsOfExperience?: number | null, moreDetails?: string | null, teachingDate?: Array<string | null> | null, teachingTime?: Array<string | null> | null, clientLimit?: number | null } | null, loginHistory?: Array<{ __typename?: 'LoginHistoryEntry', ipAddress?: string | null, userAgent?: string | null, loginAt?: string | null } | null> | null } | null };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthResponse', token: string, user: { __typename?: 'User', id: string, firstName: string, middleName?: string | null, lastName: string, email: string, role: RoleType, phoneNumber?: string | null, dateOfBirth?: string | null, gender: string } } };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'AuthResponse', token: string, user: { __typename?: 'User', id: string, firstName: string, middleName?: string | null, lastName: string, email: string, role: RoleType, phoneNumber?: string | null, dateOfBirth?: string | null, gender: string } } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'User', id: string, firstName: string, middleName?: string | null, lastName: string, email: string, phoneNumber?: string | null, dateOfBirth?: string | null, gender: string, updatedAt?: string | null, membershipDetails?: { __typename?: 'MemberDetails', membershipId?: string | null, physiqueGoalType: string, fitnessGoal?: Array<string> | null, workOutTime?: Array<string | null> | null, coachesIds?: Array<string | null> | null, hasEnteredDetails?: boolean | null, facilityBiometricEnrollmentComplete?: boolean | null } | null, coachDetails?: { __typename?: 'CoachDetails', clientsIds?: Array<string | null> | null, sessionsIds?: Array<string | null> | null, specialization?: Array<string> | null, ratings?: number | null, yearsOfExperience?: number | null, moreDetails?: string | null, teachingDate?: Array<string | null> | null, teachingTime?: Array<string | null> | null, clientLimit?: number | null } | null } | null };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser?: boolean | null };

export type DisableUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type DisableUserMutation = { __typename?: 'Mutation', disableUser?: { __typename?: 'User', id: string, isDisabled: boolean, disabledAt?: string | null, disableReason?: string | null } | null };

export type EnableUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type EnableUserMutation = { __typename?: 'Mutation', enableUser?: { __typename?: 'User', id: string, isDisabled: boolean } | null };

export type CreateMembershipMutationVariables = Exact<{
  input: CreateMembershipInput;
}>;


export type CreateMembershipMutation = { __typename?: 'Mutation', createMembership: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, statusEffectiveAt?: string | null, durationType: DurationType, monthDuration: number, createdAt?: string | null, updatedAt?: string | null } };

export type UpdateMembershipMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateMembershipInput;
}>;


export type UpdateMembershipMutation = { __typename?: 'Mutation', updateMembership: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, statusEffectiveAt?: string | null, durationType: DurationType, monthDuration: number, updatedAt?: string | null } };

export type DeleteMembershipMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteMembershipMutation = { __typename?: 'Mutation', deleteMembership: boolean };

export type PurchaseMembershipMutationVariables = Exact<{
  input: PurchaseMembershipInput;
}>;


export type PurchaseMembershipMutation = { __typename?: 'Mutation', purchaseMembership: { __typename?: 'MembershipTransaction', id: string, clientId: string, membershipId: string, priceAtPurchase: number, startedAt: string, expiresAt: string, monthDuration: number, dayDuration?: number | null, status: TransactionStatus, createdAt?: string | null, updatedAt?: string | null, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string> } | null } };

export type CancelMembershipMutationVariables = Exact<{
  transactionId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type CancelMembershipMutation = { __typename?: 'Mutation', cancelMembership: boolean };

export type UsersUpdatedSubscriptionVariables = Exact<{
  role?: InputMaybe<RoleType>;
}>;


export type UsersUpdatedSubscription = { __typename?: 'Subscription', usersUpdated: Array<{ __typename?: 'User', id: string, firstName: string, middleName?: string | null, lastName: string, email: string, role: RoleType, phoneNumber?: string | null, dateOfBirth?: string | null, gender: string, heardFrom?: Array<string | null> | null, attendanceId?: number | null, isDisabled: boolean, disabledAt?: string | null, disableReason?: string | null, createdAt?: string | null, updatedAt?: string | null, membershipDetails?: { __typename?: 'MemberDetails', membershipId?: string | null, physiqueGoalType: string, fitnessGoal?: Array<string> | null, workOutTime?: Array<string | null> | null, coachesIds?: Array<string | null> | null, hasEnteredDetails?: boolean | null, facilityBiometricEnrollmentComplete?: boolean | null, membershipTransaction?: { __typename?: 'MembershipTransaction', id: string, membershipId: string, priceAtPurchase: number, startedAt: string, expiresAt: string, monthDuration: number, dayDuration?: number | null, status: TransactionStatus, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, durationType: DurationType, monthDuration: number } | null } | null } | null, currentMembership?: { __typename?: 'MembershipTransaction', id: string, membershipId: string, priceAtPurchase: number, startedAt: string, expiresAt: string, monthDuration: number, dayDuration?: number | null, status: TransactionStatus, membership?: { __typename?: 'Membership', id: string, name: string, monthlyPrice: number, description?: string | null, features: Array<string>, status: MembershipStatus, durationType: DurationType, monthDuration: number } | null } | null, coachDetails?: { __typename?: 'CoachDetails', clientsIds?: Array<string | null> | null, sessionsIds?: Array<string | null> | null, specialization?: Array<string> | null, ratings?: number | null, yearsOfExperience?: number | null, moreDetails?: string | null, teachingDate?: Array<string | null> | null, teachingTime?: Array<string | null> | null, clientLimit?: number | null } | null, loginHistory?: Array<{ __typename?: 'LoginHistoryEntry', ipAddress?: string | null, userAgent?: string | null, loginAt?: string | null } | null> | null }> };

export type SearchWalkInClientsQueryVariables = Exact<{
  query?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SearchWalkInClientsQuery = { __typename?: 'Query', searchWalkInClients: Array<{ __typename?: 'WalkInClient', id: string, firstName: string, middleName?: string | null, lastName: string, phoneNumber?: string | null, email?: string | null, gender: WalkInGender, notes?: string | null, ageYears?: number | null, minorWaiverGuardianName?: string | null, minorWaiverAcceptedAt?: string | null, createdAt: string, updatedAt: string }> };

export type WalkInPaymentSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type WalkInPaymentSettingsQuery = { __typename?: 'Query', walkInPaymentSettings: { __typename?: 'WalkInPaymentSettings', defaultPaymentPesos: number } };

export type WalkInAttendanceLogsQueryVariables = Exact<{
  filter: WalkInLogsFilter;
  pagination?: InputMaybe<WalkInPagination>;
}>;


export type WalkInAttendanceLogsQuery = { __typename?: 'Query', walkInAttendanceLogs: { __typename?: 'WalkInLogsConnection', totalCount: number, logs: Array<{ __typename?: 'WalkInAttendanceLog', id: string, timedInAt: string, localDate: string, payment: number, createdAt: string, walkInClient: { __typename?: 'WalkInClient', id: string, firstName: string, middleName?: string | null, lastName: string, phoneNumber?: string | null, email?: string | null, gender: WalkInGender, notes?: string | null, ageYears?: number | null, minorWaiverGuardianName?: string | null, minorWaiverAcceptedAt?: string | null, createdAt: string, updatedAt: string } }> } };

export type WalkInStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type WalkInStatsQuery = { __typename?: 'Query', walkInStats: { __typename?: 'WalkInStats', totalWalkInAccounts: number, totalTimeInRecords: number } };

export type WalkInAccountsOverviewQueryVariables = Exact<{
  pagination?: InputMaybe<WalkInPagination>;
}>;


export type WalkInAccountsOverviewQuery = { __typename?: 'Query', walkInAccountsOverview: { __typename?: 'WalkInAccountsOverview', totalWalkInAccounts: number, totalTimeInRecords: number, rows: Array<{ __typename?: 'WalkInAccountRow', timeInCount: number, client: { __typename?: 'WalkInClient', id: string, firstName: string, middleName?: string | null, lastName: string, phoneNumber?: string | null, email?: string | null, gender: WalkInGender, notes?: string | null, ageYears?: number | null, minorWaiverGuardianName?: string | null, minorWaiverAcceptedAt?: string | null, createdAt: string, updatedAt: string } }> } };

export type WalkInLogsByClientQueryVariables = Exact<{
  walkInClientId: Scalars['ID']['input'];
  pagination?: InputMaybe<WalkInPagination>;
}>;


export type WalkInLogsByClientQuery = { __typename?: 'Query', walkInLogsByClient: { __typename?: 'WalkInLogsConnection', totalCount: number, logs: Array<{ __typename?: 'WalkInAttendanceLog', id: string, timedInAt: string, localDate: string, payment: number, createdAt: string, walkInClient: { __typename?: 'WalkInClient', id: string, firstName: string, middleName?: string | null, lastName: string, phoneNumber?: string | null, email?: string | null, gender: WalkInGender, notes?: string | null, ageYears?: number | null, minorWaiverGuardianName?: string | null, minorWaiverAcceptedAt?: string | null, createdAt: string, updatedAt: string } }> } };

export type UpdateWalkInPaymentSettingsMutationVariables = Exact<{
  paymentPesos: Scalars['Float']['input'];
}>;


export type UpdateWalkInPaymentSettingsMutation = { __typename?: 'Mutation', updateWalkInPaymentSettings: { __typename?: 'WalkInPaymentSettings', defaultPaymentPesos: number } };

export type CreateWalkInClientMutationVariables = Exact<{
  input: CreateWalkInClientInput;
  timeInNow: Scalars['Boolean']['input'];
}>;


export type CreateWalkInClientMutation = { __typename?: 'Mutation', createWalkInClient: { __typename?: 'CreateWalkInClientResult', client: { __typename?: 'WalkInClient', id: string, firstName: string, middleName?: string | null, lastName: string, phoneNumber?: string | null, email?: string | null, gender: WalkInGender, notes?: string | null, ageYears?: number | null, minorWaiverGuardianName?: string | null, minorWaiverAcceptedAt?: string | null }, log?: { __typename?: 'WalkInAttendanceLog', id: string, timedInAt: string, localDate: string, payment: number } | null } };

export type WalkInTimeInMutationVariables = Exact<{
  walkInClientId: Scalars['ID']['input'];
  at?: InputMaybe<Scalars['String']['input']>;
}>;


export type WalkInTimeInMutation = { __typename?: 'Mutation', walkInTimeIn: { __typename?: 'WalkInAttendanceLog', id: string, timedInAt: string, localDate: string, payment: number, walkInClient: { __typename?: 'WalkInClient', id: string, firstName: string, lastName: string } } };

export type UpdateWalkInClientMutationVariables = Exact<{
  walkInClientId: Scalars['ID']['input'];
  input: UpdateWalkInClientInput;
}>;


export type UpdateWalkInClientMutation = { __typename?: 'Mutation', updateWalkInClient: { __typename?: 'WalkInClient', id: string, firstName: string, middleName?: string | null, lastName: string, phoneNumber?: string | null, email?: string | null, gender: WalkInGender, notes?: string | null, ageYears?: number | null, minorWaiverGuardianName?: string | null, minorWaiverAcceptedAt?: string | null, createdAt: string, updatedAt: string } };

export type GetUsersAttendanceRosterQueryVariables = Exact<{
  role?: InputMaybe<RoleType>;
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetUsersAttendanceRosterQuery = { __typename?: 'Query', getUsers?: Array<{ __typename?: 'User', id: string, firstName: string, middleName?: string | null, lastName: string, email: string, role: RoleType, attendanceId?: number | null } | null> | null };
