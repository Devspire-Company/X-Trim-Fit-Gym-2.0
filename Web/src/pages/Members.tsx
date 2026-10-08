import { useState, useMemo, useEffect, useRef } from 'react';
import { useNotifyMembershipExpiry } from '@/hooks/useNotifyMembershipExpiry';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import {
	Search,
	Eye,
	Ban,
	Users,
	X,
	Loader2,
	MoreVertical,
	UserCog,
	Activity,
	TrendingUp,
	Calendar,
	Clock,
	Target,
	Dumbbell,
	FileText,
	RotateCw,
} from 'lucide-react';
import {
	GET_USERS,
	GET_USER,
	DISABLE_USER,
	ENABLE_USER,
	CANCEL_MEMBERSHIP,
	DIRECT_SUBSCRIBE_MEMBER,
	USERS_UPDATED,
	GET_PENDING_SUBSCRIPTION_REQUESTS,
} from '@/graphql/operations/index';
import { RoleType } from '@/graphql/generated/graphql';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { ExportDownloadDropdown } from '@/components/ExportDownloadDropdown';
import { DirectSubscribeModal } from '@/components/modals/DirectSubscribeModal';
import { AdjustSubscriptionDurationModal } from '@/components/modals/AdjustSubscriptionDurationModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { exportTableCsv } from '@/lib/csvExport';
import { exportTablePdf } from '@/lib/pdfExport';
import {
	isMembershipExpiredForNotification,
	memberDisplayName,
} from '@/lib/membershipExpiry';

interface Member {
	id: string;
	name: string;
	firstName: string;
	middleName?: string;
	lastName: string;
	email: string;
	phone: string;
	membership: string;
	status: string;
	joinDate: string;
	avatar: string;
	dateOfBirth: string;
	gender: string;
	address: string;
	emergencyContact: string;
	medicalConditions: string;
	fitnessGoals: string;
	progress: {
		weightLost: number;
		workoutsCompleted: number;
	};
	transactionId?: string; // ID of the active membership transaction
	membershipId?: string; // ID of the current membership plan (for renewal)
	durationType?: string; // MONTHLY, QUARTERLY, YEARLY, DAILY
	startDate?: string; // Subscription start date
	endDate?: string; // Subscription expiration date
	expiresAt?: string; // Subscription expiration date (ISO format)
	createdAt?: string; // Account creation date (ISO format) for filtering
	subscriptionMonthDuration?: number;
	/** True when subscription is tracked in calendar days (daily / promo). */
	subscriptionUsesDays?: boolean;
	subscriptionDayDuration?: number | null;
	/** Active transaction `startedAt` (ISO) for admin duration/start overrides. */
	subscriptionStartedAt?: string;
	disableReason?: string;
	disabledAt?: string;
	updatedAt?: string;
}

const normalizeFilterValue = (value: string | null | undefined): string =>
	(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

const LIVE_UPDATE_INTERVAL_MS = 1500;
const PAUSED_AFTER_EXPIRY_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const PAUSED_MARKER_STORAGE_KEY = 'members.pausedAfterExpiry.v1';

export function MembersPage() {
	useEffect(() => {
		document.title = 'Member Management - X-TRIM FIT GYM';
	}, []);

	const dispatch = useAppDispatch();
	const currentUser = useAppSelector((state) => state.auth.user);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [membershipFilter, setMembershipFilter] = useState<string>('all');
	const [selectedMember, setSelectedMember] = useState<Member | null>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [disableReason, setDisableReason] = useState('');
	const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
	const [memberToSubscribe, setMemberToSubscribe] = useState<{ id: string; name: string } | null>(
		null
	);
	const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState(false);
	const [unsubscribeReason, setUnsubscribeReason] = useState('');
	const [memberToUnsubscribe, setMemberToUnsubscribe] = useState<{
		id: string;
		name: string;
		transactionId: string;
	} | null>(null);
	const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
	const [memberToRenew, setMemberToRenew] = useState<{
		id: string;
		name: string;
		membershipId: string;
		membershipName: string;
	} | null>(null);
	const [isAdjustDurationOpen, setIsAdjustDurationOpen] = useState(false);
	const [memberToAdjustDuration, setMemberToAdjustDuration] = useState<{
		id: string;
		name: string;
		transactionId: string;
		monthDuration: number;
		dayDuration: number;
		usesDays: boolean;
		currentStartedAtIso?: string;
	} | null>(null);
	const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
	const [expiredMemberModalName, setExpiredMemberModalName] = useState<string | null>(
		null
	);
	const [nowMs, setNowMs] = useState(() => Date.now());
	const [pausedMarkersByMemberId, setPausedMarkersByMemberId] = useState<Record<string, number>>(
		() => {
			try {
				if (typeof window === 'undefined') return {};
				const raw = window.localStorage.getItem(PAUSED_MARKER_STORAGE_KEY);
				if (!raw) return {};
				const parsed = JSON.parse(raw) as Record<string, number>;
				if (!parsed || typeof parsed !== 'object') return {};
				return parsed;
			} catch {
				return {};
			}
		}
	);
	const prevExpirySnapshotRef = useRef<Map<string, boolean> | null>(null);
	const prevMembershipTxByMemberIdRef = useRef<
		Map<string, { status: string; expiresAt: string | null }>
	>(new Map());

	useEffect(() => {
		const id = setInterval(() => setNowMs(Date.now()), LIVE_UPDATE_INTERVAL_MS);
		return () => clearInterval(id);
	}, []);

	useEffect(() => {
		try {
			if (typeof window === 'undefined') return;
			window.localStorage.setItem(
				PAUSED_MARKER_STORAGE_KEY,
				JSON.stringify(pausedMarkersByMemberId)
			);
		} catch {
			/* ignore persistence issues */
		}
	}, [pausedMarkersByMemberId]);

	const closeMemberActionsMenu = () => setOpenDropdownId(null);

	const memberMenuItemClass =
		'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--text-primary)] outline-none transition-colors focus-visible:bg-[rgba(255,255,255,0.08)] focus-visible:ring-2 focus-visible:ring-[rgba(249,197,19,0.35)] disabled:pointer-events-none disabled:opacity-45';

	// Initial data fetch with query
	const { data, loading, error } = useQuery(GET_USERS, {
		variables: { role: RoleType.Member, includeDisabled: true },
		errorPolicy: 'none',
		pollInterval: LIVE_UPDATE_INTERVAL_MS,
	});
	const { data: pendingData } = useQuery(GET_PENDING_SUBSCRIPTION_REQUESTS, {
		errorPolicy: 'ignore',
		pollInterval: LIVE_UPDATE_INTERVAL_MS,
	});

	// Real-time subscription for member updates
	const { data: subscriptionData } = useSubscription(USERS_UPDATED, {
		variables: { role: RoleType.Member },
		skip: !data, // Skip if initial data not loaded
	});

	// Merge subscription payload into the last query result so rows don't disappear
	// if the websocket sends a partial usersUpdated list.
	const membersData = useMemo(() => {
		const queriedMembers = (data?.getUsers || []) as any[];
		const subscribedMembers = (subscriptionData?.usersUpdated || []) as any[];
		if (subscribedMembers.length === 0) return queriedMembers;

		const mergedById = new Map<string, any>();
		queriedMembers.forEach((member) => {
			mergedById.set(member.id, member);
		});
		subscribedMembers.forEach((member) => {
			const previous = mergedById.get(member.id) || {};
			mergedById.set(member.id, { ...previous, ...member });
		});
		return Array.from(mergedById.values());
	}, [data?.getUsers, subscriptionData?.usersUpdated]);

	useNotifyMembershipExpiry(membersData, loading);

	useEffect(() => {
		if (loading) return;
		const currentList = (membersData || []) as Record<string, unknown>[];
		setPausedMarkersByMemberId((prev) => {
			const next: Record<string, number> = {};
			const cutoff = Date.now() - PAUSED_AFTER_EXPIRY_WINDOW_MS;
			for (const [id, ts] of Object.entries(prev)) {
				if (typeof ts === 'number' && ts >= cutoff) {
					next[id] = ts;
				}
			}
			for (const member of currentList) {
				const id = member.id;
				if (typeof id !== 'string') continue;
				const tx = (member.currentMembership ||
					(member.membershipDetails as Record<string, unknown> | undefined)
						?.membershipTransaction) as
					| { status?: string | null; expiresAt?: string | null }
					| null
					| undefined;
				const txStatus = String(tx?.status || '').toUpperCase();
				const txExpiresAt = tx?.expiresAt ? String(tx.expiresAt) : null;
				const previousTx = prevMembershipTxByMemberIdRef.current.get(id);

				// Case 1: Current payload explicitly says expired.
				if (isMembershipExpiredForNotification(member) && !next[id]) {
					next[id] = Date.now();
				}
				// Case 2: Current tx disappeared, but previous snapshot had active tx that is already past expiry.
				if (!tx && previousTx) {
					const prevStatus = String(previousTx.status || '').toUpperCase();
					const prevExpMs = previousTx.expiresAt
						? new Date(previousTx.expiresAt).getTime()
						: NaN;
					const prevAlreadyExpired = Number.isFinite(prevExpMs) && prevExpMs <= Date.now();
					if ((prevStatus === 'ACTIVE' && prevAlreadyExpired) || prevStatus === 'EXPIRED') {
						if (!next[id]) next[id] = Date.now();
					}
				}
				if (txStatus === 'ACTIVE' && next[id]) {
					delete next[id];
				}

				if (tx) {
					prevMembershipTxByMemberIdRef.current.set(id, {
						status: txStatus,
						expiresAt: txExpiresAt,
					});
				} else {
					prevMembershipTxByMemberIdRef.current.delete(id);
				}
			}
			return next;
		});
	}, [membersData, loading]);

	useEffect(() => {
		if (loading) return;
		const currentList = (membersData || []) as Record<string, unknown>[];
		if (prevExpirySnapshotRef.current === null) {
			const initMap = new Map<string, boolean>();
			for (const member of currentList) {
				const id = member.id;
				if (typeof id !== 'string') continue;
				initMap.set(id, isMembershipExpiredForNotification(member));
			}
			prevExpirySnapshotRef.current = initMap;
			return;
		}

		const previous = prevExpirySnapshotRef.current;
		const nextMap = new Map<string, boolean>();
		let newlyExpiredMemberName: string | null = null;
		for (const member of currentList) {
			const id = member.id;
			if (typeof id !== 'string') continue;
			const nowExpired = isMembershipExpiredForNotification(member);
			nextMap.set(id, nowExpired);
			const wasExpired = previous.get(id) ?? false;
			if (nowExpired && !wasExpired && !newlyExpiredMemberName) {
				newlyExpiredMemberName = memberDisplayName(member);
			}
		}
		prevExpirySnapshotRef.current = nextMap;
		if (newlyExpiredMemberName) {
			setExpiredMemberModalName(newlyExpiredMemberName);
		}
	}, [membersData, loading]);

	const [disableUserMutation] = useMutation(DISABLE_USER, {
		refetchQueries: [{ query: GET_USERS, variables: { role: RoleType.Member, includeDisabled: true } }],
		onCompleted: () => {
			dispatch(
				addToast({
					type: 'success',
					message: 'Member disabled successfully',
				})
			);
			// Subscription will automatically update the data
		},
		onError: (error) => {
			dispatch(
				addToast({
					type: 'error',
					message: error.message || 'Failed to disable member',
				})
			);
		},
	});
	const [enableUserMutation] = useMutation(ENABLE_USER, {
		refetchQueries: [{ query: GET_USERS, variables: { role: RoleType.Member, includeDisabled: true } }],
		onCompleted: () => {
			dispatch(addToast({ type: 'success', message: 'Member enabled successfully' }));
		},
		onError: (error) => {
			dispatch(addToast({ type: 'error', message: error.message || 'Failed to enable member' }));
		},
	});

	const [cancelMembershipMutation, { loading: isUnsubscribing }] = useMutation(CANCEL_MEMBERSHIP, {
		onCompleted: () => {
			dispatch(
				addToast({
					type: 'success',
					message: `Successfully unsubscribed ${memberToUnsubscribe?.name}`,
				})
			);
			setIsUnsubscribeModalOpen(false);
			setMemberToUnsubscribe(null);
			setUnsubscribeReason('');
			// Subscription will automatically update the data
		},
		onError: (error) => {
			dispatch(
				addToast({
					type: 'error',
					message: error.message || 'Failed to unsubscribe member',
				})
			);
		},
	});

	const [renewMembershipMutation, { loading: isRenewing }] = useMutation(DIRECT_SUBSCRIBE_MEMBER, {
		refetchQueries: [
			{ query: GET_USERS, variables: { role: 'member' } },
		],
		awaitRefetchQueries: true, // Wait for refetch to complete before showing success
		onCompleted: (data) => {
			const membershipName = data.directSubscribeMember.membership?.name || memberToRenew?.membershipName || 'the plan';
			const expiresAt = data.directSubscribeMember.expiresAt;
			const expirationDate = expiresAt 
				? new Date(expiresAt).toLocaleDateString('en-US', { 
					month: 'short', 
					day: 'numeric', 
					year: 'numeric' 
				})
				: null;
			
			dispatch(
				addToast({
					type: 'success',
					message: `Successfully renewed ${memberToRenew?.name}'s subscription to ${membershipName}${expirationDate ? ` (expires ${expirationDate})` : ''}`,
				})
			);
			setIsRenewModalOpen(false);
			setMemberToRenew(null);
			// Subscription will automatically update the data, and refetchQueries ensures fresh data
		},
		onError: (error) => {
			dispatch(
				addToast({
					type: 'error',
					message: error.message || 'Failed to renew membership',
				})
			);
		},
	});

	// Helper function to safely extract ID from various formats
	const extractId = (value: any): string | undefined => {
		if (!value) return undefined;
		
		// If it's already a string and not "[object Object]", return it
		if (typeof value === 'string') {
			if (value === '[object Object]' || value === 'undefined' || value === 'null') {
				return undefined;
			}
			return value;
		}

		// If it's an object, extract the ID
		if (typeof value === 'object' && value !== null) {
			// Try common ID field names
			if (value.id !== undefined && value.id !== null) {
				const id = value.id;
				if (typeof id === 'string') return id;
				if (typeof id === 'object' && id !== null) {
					// Nested object, try to extract ID
					return extractId(id);
				}
				return String(id);
			}
			if (value._id !== undefined && value._id !== null) {
				const id = value._id;
				if (typeof id === 'string') return id;
				if (typeof id === 'object' && id !== null) {
					return extractId(id);
				}
				return String(id);
			}
			// If it's an array with one element, try that
			if (Array.isArray(value) && value.length > 0) {
				return extractId(value[0]);
			}
		}
		
		// Last resort: try to convert to string, but check if it's valid
		const str = String(value);
		if (str === '[object Object]' || str === 'undefined' || str === 'null') {
			return undefined;
		}
		return str;
	};


	// Transform API data
	const apiMembers: Member[] = membersData.map((m: any) => {
		const hasPendingRequest =
			(pendingData?.getPendingSubscriptionRequests || []).some(
				(req: any) => req.memberId === m.id
			);
		// Check both currentMembership and membershipTransaction for subscription info
		const membershipTransaction = m.currentMembership || m.membershipDetails?.membershipTransaction;
		const membership = membershipTransaction?.membership?.name || 'No Plan';
		const status = m.isDisabled
			? 'Disabled'
			: membershipTransaction?.status === 'ACTIVE'
				? 'Active'
				: hasPendingRequest
					? 'Pending'
					: 'Inactive';
		const joinDate = m.createdAt
			? new Date(m.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
			: 'N/A';

		const durationType =
			membershipTransaction?.membership?.durationType || membershipTransaction?.durationType;
		const startDate =
			membershipTransaction?.startedAt || membershipTransaction?.startDate || membershipTransaction?.createdAt || m.createdAt;
		const expiresAt = membershipTransaction?.expiresAt || membershipTransaction?.endDate;
		
		// Format expiration date for display
		const formatExpirationDate = (dateString: string | undefined): string | undefined => {
			if (!dateString) return undefined;
			try {
				const date = new Date(dateString);
				if (isNaN(date.getTime())) return undefined;
				// Format as "Jan 15, 2025"
				return date.toLocaleDateString('en-US', { 
					month: 'short', 
					day: 'numeric', 
					year: 'numeric' 
				});
			} catch {
				return undefined;
			}
		};
		
		const expirationDate = formatExpirationDate(expiresAt);

		const txDayDur = membershipTransaction?.dayDuration as number | undefined | null;
		const planDurType = membershipTransaction?.membership?.durationType as string | undefined;
		const subscriptionUsesDays =
			(typeof txDayDur === 'number' && txDayDur >= 1) || planDurType === 'DAILY';
		let subscriptionDayDuration: number | null = null;
		if (typeof txDayDur === 'number' && txDayDur >= 1) {
			subscriptionDayDuration = txDayDur;
		} else if (planDurType === 'DAILY') {
			const md = membershipTransaction?.membership?.monthDuration;
			subscriptionDayDuration = typeof md === 'number' && md >= 1 ? md : 1;
		} else if (expiresAt && startDate) {
			try {
				const s = new Date(startDate as string).getTime();
				const e = new Date(expiresAt as string).getTime();
				if (Number.isFinite(s) && Number.isFinite(e) && e > s) {
					subscriptionDayDuration = Math.max(1, Math.round((e - s) / 86400000));
				}
			} catch {
				/* ignore */
			}
		}
		
		// Calculate days until expiration for color coding
		const getDaysUntilExpiration = (dateString: string | undefined): number | null => {
			if (!dateString) return null;
			try {
				const expiration = new Date(dateString);
				const now = new Date();
				const diffTime = expiration.getTime() - now.getTime();
				const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				return days > 0 ? days : 0;
			} catch {
				return null;
			}
		};
		
		void getDaysUntilExpiration(expiresAt);

		// Extract membership ID - try multiple sources
		let membershipId: string | undefined;
		if (membershipTransaction) {
			// First try the direct membershipId field
			const rawMembershipId = membershipTransaction.membershipId;
			if (rawMembershipId !== undefined && rawMembershipId !== null) {
				// Check if it's already a valid string (and not "[object Object]")
				if (typeof rawMembershipId === 'string') {
					if (rawMembershipId !== '[object Object]' && rawMembershipId !== 'undefined' && rawMembershipId !== 'null') {
						membershipId = rawMembershipId;
					}
				} else if (typeof rawMembershipId === 'object') {
					// It's an object, extract the ID before it gets stringified
					membershipId = extractId(rawMembershipId);
				}
			}
			
			// If that didn't work, try membership.id (this is usually more reliable)
			if (!membershipId && membershipTransaction.membership) {
				const membershipObj = membershipTransaction.membership;
				const rawId = membershipObj.id;
				if (rawId !== undefined && rawId !== null) {
					if (typeof rawId === 'string') {
						if (rawId !== '[object Object]' && rawId !== 'undefined' && rawId !== 'null') {
							membershipId = rawId;
						}
					} else if (typeof rawId === 'object') {
						membershipId = extractId(rawId);
					}
				}
			}
			
			// Debug: Log if we couldn't extract the ID
			if (!membershipId && membershipTransaction) {
				console.warn('⚠️ Could not extract membershipId for member:', {
					memberId: m.id,
					membershipTransaction: {
						hasMembershipId: !!membershipTransaction.membershipId,
						membershipIdType: typeof membershipTransaction.membershipId,
						hasMembership: !!membershipTransaction.membership,
						hasMembershipObjId: !!membershipTransaction.membership?.id,
						membershipObjIdType: typeof membershipTransaction.membership?.id,
					},
				});
			}
		}

		return {
			id: m.id,
			name: `${m.firstName} ${m.middleName ? m.middleName + ' ' : ''}${m.lastName}`,
			firstName: m.firstName,
			middleName: m.middleName,
			lastName: m.lastName,
			email: m.email,
			phone: m.phoneNumber || 'N/A',
			membership,
			status,
			joinDate,
			avatar: `${m.firstName?.[0] || ''}${m.lastName?.[0] || ''}`,
			dateOfBirth: m.dateOfBirth || 'N/A',
			gender: m.gender || 'N/A',
			address: 'N/A', // Not in API schema
			emergencyContact: 'N/A', // Not in API schema
			medicalConditions: 'None', // Not in API schema
			fitnessGoals: m.membershipDetails?.fitnessGoal?.join(', ') || 'N/A',
			progress: {
				weightLost: 0, // Would need session logs from API
				workoutsCompleted: 0, // Would need session logs from API
			},
			transactionId: membershipTransaction?.id, // Store transaction ID for unsubscribe
			membershipId, // Store membership ID for renewal
			durationType,
			startDate,
			endDate: expirationDate, // Formatted expiration date for display
			expiresAt: expiresAt, // Raw expiration date (ISO format) for calculations
			createdAt: m.createdAt, // Raw creation date for filtering
			subscriptionMonthDuration:
				typeof membershipTransaction?.monthDuration === 'number'
					? membershipTransaction.monthDuration
					: membershipTransaction?.membership?.monthDuration,
			subscriptionUsesDays,
			subscriptionDayDuration,
			subscriptionStartedAt:
				typeof membershipTransaction?.startedAt === 'string' ? membershipTransaction.startedAt : undefined,
			disableReason: typeof m.disableReason === 'string' ? m.disableReason : '',
			disabledAt: typeof m.disabledAt === 'string' ? m.disabledAt : undefined,
			updatedAt: typeof m.updatedAt === 'string' ? m.updatedAt : undefined,
		};
	});

	const membershipOptions = useMemo(() => {
		const unique = new Set<string>();
		apiMembers.forEach((member) => {
			if (member.membership && member.membership.trim()) {
				unique.add(member.membership.trim());
			}
		});
		return Array.from(unique).sort((a, b) => a.localeCompare(b));
	}, [apiMembers]);

	useEffect(() => {
		if (membershipFilter === 'all') return;
		const exists = membershipOptions.some((plan) => plan === membershipFilter);
		if (!exists) {
			setMembershipFilter('all');
		}
	}, [membershipFilter, membershipOptions]);

	const filteredMembers = useMemo(() => {
		const normalizedSearch = normalizeFilterValue(searchTerm);
		const normalizedStatusFilter = normalizeFilterValue(statusFilter);
		const normalizedMembershipFilter = normalizeFilterValue(membershipFilter);

		const filtered = apiMembers.filter((member) => {
			const searchable = normalizeFilterValue(
				`${member.name} ${member.email} ${member.phone} ${member.membership} ${member.status} ${member.id}`,
			);
			const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
			const matchesStatus =
				statusFilter === 'all' ||
				normalizeFilterValue(member.status) === normalizedStatusFilter;
			const matchesMembership =
				membershipFilter === 'all' ||
				normalizeFilterValue(member.membership) === normalizedMembershipFilter;

			return matchesSearch && matchesStatus && matchesMembership;
		});

		// Keep disabled accounts at the bottom for better admin prioritization.
		return [...filtered].sort((a, b) => {
			const aDisabled = a.status === 'Disabled';
			const bDisabled = b.status === 'Disabled';
			if (aDisabled === bDisabled) return 0;
			return aDisabled ? 1 : -1;
		});
	}, [apiMembers, searchTerm, statusFilter, membershipFilter]);

	const isMemberInPausedWindow = (member: Member): boolean => {
		const pausedMarkedAt = pausedMarkersByMemberId[member.id];
		const pausedByMarker =
			typeof pausedMarkedAt === 'number' &&
			nowMs < pausedMarkedAt + PAUSED_AFTER_EXPIRY_WINDOW_MS;
		const normalizedMembership = String(member.membership || '')
			.trim()
			.toLowerCase();
		const looksNoPlan = normalizedMembership === 'no plan';
		const updatedAtMs = member.updatedAt ? new Date(member.updatedAt).getTime() : NaN;
		const pausedByRecentInactiveUpdate =
			member.status === 'Inactive' &&
			looksNoPlan &&
			Number.isFinite(updatedAtMs) &&
			nowMs - updatedAtMs >= 0 &&
			nowMs - updatedAtMs < PAUSED_AFTER_EXPIRY_WINDOW_MS;
		const pausedFromExpiresAt =
			typeof member.expiresAt === 'string' &&
			Number.isFinite(new Date(member.expiresAt).getTime()) &&
			nowMs >= new Date(member.expiresAt).getTime() &&
			nowMs < new Date(member.expiresAt).getTime() + PAUSED_AFTER_EXPIRY_WINDOW_MS;
		return pausedByMarker || pausedByRecentInactiveUpdate || pausedFromExpiresAt;
	};

	const memberExportHead = ['Member', 'Email', 'Phone', 'Membership', 'Status', 'Disabled Reason', 'Join Date', 'Expires'];
	const memberExportRows = filteredMembers.map((member) => [
		member.name,
		member.email,
		member.phone,
		member.membership,
		member.status,
		member.status === 'Disabled' ? member.disableReason || 'No reason provided' : '—',
		member.joinDate,
		member.endDate || '—',
	]);

	const handleExportPdf = () => {
		exportTablePdf({
			title: 'Member Management',
			filePrefix: 'members',
			subtitle: `Total rows: ${filteredMembers.length} | Status filter: ${statusFilter} | Membership filter: ${membershipFilter}`,
			reportType: 'MEMBER_MANAGEMENT',
			user: currentUser,
			filterSummary: `status=${statusFilter};membership=${membershipFilter}`,
			head: memberExportHead,
			rows: memberExportRows,
		});
	};

	const handleExportCsv = () => {
		exportTableCsv({
			filePrefix: 'members',
			head: memberExportHead,
			rows: memberExportRows,
			reportType: 'MEMBER_MANAGEMENT',
			user: currentUser,
			filterSummary: `status=${statusFilter};membership=${membershipFilter};format=csv`,
		});
	};

	const handleView = (member: Member) => {
		setSelectedMember(member);
		setIsViewModalOpen(true);
	};

	const handleDelete = (member: Member) => {
		setSelectedMember(member);
		setIsDeleteModalOpen(true);
	};

	const handleAdjustDuration = (member: Member) => {
		if (!member.transactionId) return;
		const usesDays = !!member.subscriptionUsesDays;
		const months =
			member.subscriptionMonthDuration != null && member.subscriptionMonthDuration >= 1
				? member.subscriptionMonthDuration
				: 1;
		const dayDur =
			member.subscriptionDayDuration != null && member.subscriptionDayDuration >= 1
				? member.subscriptionDayDuration
				: 1;
		setMemberToAdjustDuration({
			id: member.id,
			name: member.name,
			transactionId: member.transactionId,
			monthDuration: usesDays ? 1 : months,
			dayDuration: usesDays ? dayDur : 1,
			usesDays,
			currentStartedAtIso: member.subscriptionStartedAt,
		});
		setIsAdjustDurationOpen(true);
	};

	const handleSubscribe = (member: Member) => {
		console.log('🔔 Subscribe button clicked for member:', member);
		if (!member || !member.id) {
			console.error('❌ Invalid member data:', member);
			return;
		}
		setMemberToSubscribe({ id: member.id, name: member.name });
		setIsSubscribeModalOpen(true);
	};

	const handleUnsubscribe = (member: Member) => {
		console.log('🔔 Unsubscribe button clicked for member:', member);
		if (!member || !member.id || !member.transactionId) {
			console.error('❌ Invalid member data or missing transaction ID:', member);
			dispatch(
				addToast({
					type: 'error',
					message: 'Cannot unsubscribe: No active subscription found',
				})
			);
			return;
		}
		setMemberToUnsubscribe({
			id: member.id,
			name: member.name,
			transactionId: member.transactionId,
		});
		setIsUnsubscribeModalOpen(true);
	};

	const handleRenew = (member: Member) => {
		console.log('🔔 Renew button clicked for member:', member);
		
		if (!member || !member.id) {
			console.error('❌ Invalid member data:', member);
			dispatch(
				addToast({
					type: 'error',
					message: 'Cannot renew: Invalid member data',
				})
			);
			return;
		}
		
		// Safely extract membership ID - it should already be extracted, but double-check
		let membershipId = member.membershipId;
		if (membershipId) {
			membershipId = extractId(membershipId);
		}
		
		if (!membershipId || membershipId === 'undefined' || membershipId === 'null' || membershipId.includes('[object')) {
			console.error('❌ Invalid membership ID:', {
				original: member.membershipId,
				extracted: membershipId,
				memberData: member,
			});
			dispatch(
				addToast({
					type: 'error',
					message: 'Cannot renew: Invalid membership plan. Please refresh the page and try again.',
				})
			);
			return;
		}
		
		console.log('✅ Valid membership ID extracted:', membershipId);
		
		setMemberToRenew({
			id: member.id,
			name: member.name,
			membershipId: membershipId,
			membershipName: member.membership,
		});
		setIsRenewModalOpen(true);
	};

	const confirmDelete = async () => {
		if (selectedMember) {
			if (!disableReason.trim()) {
				dispatch(addToast({ type: 'error', message: 'Disable reason is required' }));
				return;
			}
			try {
				await disableUserMutation({
					variables: { id: selectedMember.id, reason: disableReason.trim() },
				});
				setIsDeleteModalOpen(false);
				setSelectedMember(null);
				setDisableReason('');
			} catch (err) {
				console.error('Error disabling member:', err);
			}
		}
	};

	const confirmUnsubscribe = async () => {
		if (memberToUnsubscribe) {
			if (!unsubscribeReason.trim()) {
				dispatch(addToast({ type: 'error', message: 'Reason is required to unsubscribe' }));
				return;
			}
			try {
				await cancelMembershipMutation({
					variables: {
						transactionId: memberToUnsubscribe.transactionId,
						reason: unsubscribeReason.trim(),
					},
				});
			} catch (err) {
				console.error('Error unsubscribing member:', err);
			}
		}
	};

	const confirmRenew = async () => {
		if (memberToRenew) {
			try {
				// Ensure membershipId is a string
				const membershipId = String(memberToRenew.membershipId);
				console.log('🔄 Renewing membership:', {
					memberId: memberToRenew.id,
					membershipId: membershipId,
					membershipIdType: typeof membershipId,
				});
				
				await renewMembershipMutation({
					variables: {
						input: {
							memberId: memberToRenew.id,
							membershipId: membershipId,
						},
					},
				});
			} catch (err) {
				console.error('Error renewing membership:', err);
			}
		}
	};


	// Show loading state
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-yellow)] mx-auto mb-4"></div>
					<p className="text-[var(--text-secondary)]">Loading members...</p>
				</div>
			</div>
		);
	}

	// Show error state
	if (error || !data) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="text-red-500 mb-4">
						<svg
							className="w-16 h-16 mx-auto"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
						Unable to Load Members
					</h2>
					<p className="text-[var(--text-secondary)] mb-4">
						{error?.message || 'Failed to connect to the server'}
					</p>
					<button onClick={() => window.location.reload()} className="btn-primary">
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Users className="w-8 h-8" color="var(--primary-yellow)" />
						Member Management
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-1">
						Manage all gym members, view details, and update information ({apiMembers.length} total, {filteredMembers.length} filtered)
					</p>
				</div>
				<ExportDownloadDropdown onExportPdf={handleExportPdf} onExportCsv={handleExportCsv} />
			</div>

			{/* Search and Filters */}
			<div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 backdrop-blur-md">
				<div className="search-filter-bar flex flex-col md:flex-row gap-4">
					<div className="search-box flex-1 relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
						<input
							type="text"
							placeholder="Search members by name, email, or phone..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)]"
						/>
					</div>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						aria-label="Filter members by status"
						className="px-4 py-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)]"
					>
						<option value="all">All Status</option>
						<option value="Active">Active</option>
						<option value="Inactive">Inactive</option>
						<option value="Pending">Pending</option>
						<option value="Disabled">Disabled</option>
					</select>
					<select
						value={membershipFilter}
						onChange={(e) => setMembershipFilter(e.target.value)}
						aria-label="Filter members by membership"
						className="px-4 py-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)]"
					>
						<option value="all">All Memberships</option>
						{membershipOptions.map((plan) => (
							<option key={plan} value={plan}>
								{plan}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Members Table */}
			<div className="table-container bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden backdrop-blur-md">
				<div className="overflow-x-auto">
					<table className="members-table w-full text-sm">
						<thead className="bg-[rgba(249,197,19,0.05)] border-b-2 border-[rgba(249,197,19,0.2)]">
							<tr>
								<th className="px-4 py-5 text-left text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
									Member
								</th>
								<th className="px-4 py-5 text-left text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
									Contact
								</th>
								<th className="px-4 py-5 text-center text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
									Membership
								</th>
								<th className="px-4 py-5 text-center text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
									Status
								</th>
								<th className="px-4 py-5 text-left text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
									Join Date
								</th>
								<th className="px-4 py-5 text-left text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
									Expires
								</th>
								<th className="px-4 py-5 text-center text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredMembers.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-6 py-12 text-center text-[var(--text-secondary)]">
										No members found
									</td>
								</tr>
							) : (
								filteredMembers.map((member) => (
									<tr
										key={member.id}
										className={`members-table tbody tr ${
											member.status === 'Disabled'
												? 'bg-[rgba(71,85,105,0.30)] opacity-40'
												: ''
										}`}
									>
										<td className="px-4 py-5">
											<div className="member-info flex items-center gap-3">
												<div className="member-avatar w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--primary-red)] to-[var(--primary-yellow)] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
													{member.avatar}
												</div>
												<div className="member-details">
													<h4 className="font-semibold text-[var(--text-primary)] mb-1">
														{member.name}
													</h4>
													<p className="text-xs text-[var(--text-secondary)]">ID: {member.id}</p>
												</div>
											</div>
										</td>
										<td className="px-4 py-5">
											<div className="contact-info text-sm">
												<div className="text-[var(--text-primary)]">{member.email}</div>
												<div className="text-[var(--text-secondary)]">{member.phone}</div>
											</div>
										</td>
										<td className="px-4 py-5 text-center">
											<span
												className={`membership-badge inline-flex min-w-[110px] items-center justify-center px-2.5 py-1.5 text-xs rounded-lg font-semibold ${
													member.membership === 'Student'
														? 'student bg-[rgba(59,130,246,0.14)] text-[#93C5FD] border border-[rgba(59,130,246,0.3)]'
														: member.membership === 'PROMO Student'
															? 'promo-student bg-[rgba(139,92,246,0.14)] text-[#C4B5FD] border border-[rgba(139,92,246,0.3)]'
															: member.membership.toLowerCase().includes('no plan')
																? 'bg-[rgba(148,163,184,0.14)] text-[#CBD5E1] border border-[rgba(148,163,184,0.3)]'
																: 'non-student bg-[rgba(20,184,166,0.14)] text-[#99F6E4] border border-[rgba(20,184,166,0.3)]'
												}`}
											>
												{member.membership}
											</span>
										</td>
										<td className="px-4 py-5 text-center">
											{(() => {
												const displayStatus = isMemberInPausedWindow(member)
													? 'Paused'
													: member.status;
												if (displayStatus === 'Paused') {
													return (
														<span className="relative inline-flex items-center group">
															<span className="status-badge inline-flex min-w-[90px] items-center justify-center px-2.5 py-1.5 text-xs rounded-lg font-semibold bg-[rgba(245,158,11,0.16)] text-[#FBBF24] border border-[rgba(245,158,11,0.35)]">
																Paused
															</span>
															<span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-lg border border-[rgba(249,197,19,0.25)] bg-[rgba(16,18,24,0.96)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--text-primary)] opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-opacity duration-150 group-hover:opacity-100">
																Recently expired - within 3 days
															</span>
														</span>
													);
												}
												return (
											<span
												className={`status-badge inline-flex min-w-[90px] items-center justify-center px-2.5 py-1.5 text-xs rounded-lg font-semibold ${
													displayStatus === 'Active'
														? 'active bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)]'
														: displayStatus === 'Inactive'
															? 'inactive bg-[rgba(107,114,128,0.15)] text-[#9CA3AF] border border-[rgba(107,114,128,0.3)]'
															: displayStatus === 'Pending'
																	? 'bg-[rgba(59,130,246,0.15)] text-[#93C5FD] border border-[rgba(59,130,246,0.3)]'
															: 'suspended bg-[rgba(148,163,184,0.16)] text-[#E2E8F0] border border-[rgba(148,163,184,0.35)]'
												}`}
											>
												{displayStatus}
											</span>
												);
											})()}
										</td>
										<td className="px-4 py-5 text-sm text-[var(--text-secondary)]">
											{member.joinDate}
										</td>
										<td className="px-4 py-5 text-sm">
											{(() => {
												if (!member.expiresAt) {
													return <span className="text-[var(--text-secondary)]">—</span>;
												}
												const expirationMs = new Date(member.expiresAt).getTime();
												if (!Number.isFinite(expirationMs)) {
													return <span className="text-[var(--text-secondary)]">—</span>;
												}
												const isPausedWindow =
													nowMs >= expirationMs &&
													nowMs < expirationMs + PAUSED_AFTER_EXPIRY_WINDOW_MS;
												if (member.status !== 'Active' || isPausedWindow) {
													return <span className="text-[var(--text-secondary)]">—</span>;
												}

												const diffTime = expirationMs - nowMs;
												const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
												const isExpiringSoon = daysUntil <= 7;
												const isExpiringWithinMonth = daysUntil <= 30 && daysUntil > 7;
												return (
													<span
														className={`px-2.5 py-1.5 text-xs rounded-lg font-semibold ${
															isExpiringSoon
																? 'bg-[rgba(239,68,68,0.15)] text-[#EF4444] border border-[rgba(239,68,68,0.3)]'
																: isExpiringWithinMonth
																	? 'bg-[rgba(249,197,19,0.15)] text-[var(--primary-yellow)] border border-[rgba(249,197,19,0.3)]'
																	: 'bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)]'
														}`}
													>
														{member.endDate || 'N/A'}
													</span>
												);
											})()}
										</td>
										<td className="px-4 py-5 text-center">
											<Popover
												open={openDropdownId === member.id}
												onOpenChange={(open) =>
													setOpenDropdownId(open ? member.id : null)
												}
											>
												<PopoverTrigger asChild>
													<button
														type="button"
														className={`btn-small inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors data-[state=open]:border-[var(--primary-yellow)] data-[state=open]:ring-2 data-[state=open]:ring-[rgba(249,197,19,0.2)] ${
															member.status === 'Disabled'
																? 'bg-[rgba(71,85,105,0.28)] text-[#CBD5E1] border-[rgba(148,163,184,0.35)]'
																: 'bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)] border-[var(--card-border)]'
														}`}
														title="Member actions"
														aria-label={`Open actions for ${member.name}`}
													>
														<MoreVertical className="w-4 h-4" aria-hidden />
													</button>
												</PopoverTrigger>
												<PopoverContent
													align="end"
													sideOffset={8}
													collisionPadding={16}
													onCloseAutoFocus={(e) => e.preventDefault()}
													className="w-[min(100vw-2rem,15rem)] rounded-xl border border-[rgba(255,255,255,0.12)] !bg-[#16181f] p-1.5 text-[var(--text-primary)] shadow-2xl ring-1 ring-black/25"
												>
													<div
														role="menu"
														className="flex flex-col gap-0.5"
														aria-label={`Actions for ${member.name}`}
													>
													<button
														type="button"
														role="menuitem"
														className={memberMenuItemClass}
														onClick={() => {
															handleView(member);
															closeMemberActionsMenu();
														}}
													>
														View details
													</button>

													{member.status === 'Disabled' ? (
														<>
															<div
																className="mx-1 my-1 h-px bg-[rgba(255,255,255,0.08)]"
																role="separator"
															/>
															<button
																type="button"
																role="menuitem"
																className={memberMenuItemClass}
																onClick={async () => {
																	try {
																		await enableUserMutation({
																			variables: { id: member.id },
																		});
																		closeMemberActionsMenu();
																	} catch {
																		/* toast from mutation */
																	}
																}}
															>
																Enable account
															</button>
														</>
													) : member.status === 'Active' && member.transactionId ? (
														<>
															<div
																className="mx-1 my-1 h-px bg-[rgba(255,255,255,0.08)]"
																role="separator"
															/>
															<button
																type="button"
																role="menuitem"
																className={memberMenuItemClass}
																onClick={() => {
																	handleRenew(member);
																	closeMemberActionsMenu();
																}}
															>
																Renew plan
															</button>
															<button
																type="button"
																role="menuitem"
																className={memberMenuItemClass}
																onClick={() => {
																	handleAdjustDuration(member);
																	closeMemberActionsMenu();
																}}
															>
																Edit subscription length
															</button>
															<button
																type="button"
																role="menuitem"
																className={memberMenuItemClass}
																onClick={() => {
																	handleUnsubscribe(member);
																	closeMemberActionsMenu();
																}}
															>
																Unsubscribe
															</button>
														</>
													) : (
														<>
															<div
																className="mx-1 my-1 h-px bg-[rgba(255,255,255,0.08)]"
																role="separator"
															/>
															<button
																type="button"
																role="menuitem"
																className={memberMenuItemClass}
																onClick={() => {
																	handleSubscribe(member);
																	closeMemberActionsMenu();
																}}
															>
																Subscribe to plan
															</button>
														</>
													)}

													{member.status !== 'Disabled' && (
														<>
															<div
																className="mx-1 my-1 h-px bg-[rgba(255,255,255,0.08)]"
																role="separator"
															/>
															<button
																type="button"
																role="menuitem"
																className={`${memberMenuItemClass} focus-visible:ring-[rgba(239,68,68,0.35)]`}
																onClick={() => {
																	handleDelete(member);
																	closeMemberActionsMenu();
																}}
															>
																Disable account
															</button>
														</>
													)}
													</div>
												</PopoverContent>
											</Popover>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* View Modal */}
			<div
				className={`modal-overlay ${isViewModalOpen && selectedMember ? 'active' : ''}`}
				onClick={() => {
					setIsViewModalOpen(false);
					setSelectedMember(null);
				}}
			>
				{selectedMember && (
					<MemberViewModal
						member={selectedMember}
						onClose={() => {
							setIsViewModalOpen(false);
							setSelectedMember(null);
						}}
					/>
				)}
			</div>

			{/* Disable Member Modal */}
			<div
				className={`modal-overlay ${isDeleteModalOpen && selectedMember ? 'active' : ''}`}
				onClick={() => {
					setIsDeleteModalOpen(false);
					setSelectedMember(null);
					setDisableReason('');
				}}
			>
				{selectedMember && (
					<div className="modal modal-center" onClick={(e) => e.stopPropagation()}>
						<div className="modal-body">
							<div className="modal-delete-icon">
								<Ban className="w-10 h-10" />
							</div>
							<h3 className="modal-delete-title">Disable Member?</h3>
							<p className="modal-delete-text">
								Disable {selectedMember.name}? Account access will be blocked but all records stay intact.
							</p>
							<div className="mb-4">
								<label className="block text-sm text-[var(--text-secondary)] mb-2">Reason for disabling</label>
								<input
									type="text"
									value={disableReason}
									onChange={(e) => setDisableReason(e.target.value)}
									placeholder="Required reason for audit trail"
									className="w-full px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)]"
								/>
							</div>
							<div className="modal-delete-actions">
								<button
									type="button"
									className="btn-secondary"
									onClick={() => {
										setIsDeleteModalOpen(false);
										setSelectedMember(null);
										setDisableReason('');
									}}
									style={{
										flex: 1,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '0.5rem',
										padding: '0.75rem 1.5rem',
										borderRadius: '0.75rem',
										fontWeight: '600',
										transition: 'all 0.2s',
										cursor: 'pointer',
									}}
								>
									Cancel
								</button>
								<button
									type="button"
									className="btn-danger"
									onClick={confirmDelete}
									style={{
										flex: 1,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '0.5rem',
										padding: '0.75rem 1.5rem',
										borderRadius: '0.75rem',
										fontWeight: '600',
										transition: 'all 0.2s',
										cursor: 'pointer',
									}}
								>
									Disable
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{memberToAdjustDuration && (
				<AdjustSubscriptionDurationModal
					isOpen={isAdjustDurationOpen}
					onClose={() => {
						setIsAdjustDurationOpen(false);
						setMemberToAdjustDuration(null);
					}}
					transactionId={memberToAdjustDuration.transactionId}
					memberName={memberToAdjustDuration.name}
					usesDays={memberToAdjustDuration.usesDays}
					currentMonthDuration={memberToAdjustDuration.monthDuration}
					currentDayDuration={memberToAdjustDuration.dayDuration}
					currentStartedAtIso={memberToAdjustDuration.currentStartedAtIso}
					onSuccess={() => {}}
				/>
			)}

			{/* Direct Subscribe Modal */}
			{memberToSubscribe && (
				<DirectSubscribeModal
					isOpen={isSubscribeModalOpen}
					onClose={() => {
						setIsSubscribeModalOpen(false);
						setMemberToSubscribe(null);
					}}
					memberId={memberToSubscribe.id}
					memberName={memberToSubscribe.name}
					onSuccess={() => {
						// Subscription will automatically update the data
					}}
				/>
			)}

			{/* Unsubscribe Confirmation Modal */}
			{memberToUnsubscribe && (
				<div
					className={`modal-overlay ${isUnsubscribeModalOpen ? 'active' : ''}`}
					onClick={() => {
						setIsUnsubscribeModalOpen(false);
						setMemberToUnsubscribe(null);
						setUnsubscribeReason('');
					}}
				>
					<div className="modal modal-center" onClick={(e) => e.stopPropagation()}>
						<div className="modal-body">
							<div className="mb-4 rounded-xl border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.14)] px-4 py-3">
								<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#FCA5A5]">
									Destructive action
								</p>
								<p className="mt-1 text-sm font-medium text-[#FEE2E2]">
									Review details before continuing. This cannot be undone automatically.
								</p>
							</div>

							<h2 className="modal-title mb-2 text-left">Unsubscribe member</h2>

							<p className="modal-text mb-5 text-left">
								Confirm unsubscribe for <strong>{memberToUnsubscribe.name}</strong>. They will be marked as
								inactive until subscribed again.
							</p>
							<div className="mb-5">
								<label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
									Reason
								</label>
								<input
									type="text"
									value={unsubscribeReason}
									onChange={(e) => setUnsubscribeReason(e.target.value)}
									placeholder="Required reason"
									className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.15)]"
								/>
								<p className="mt-1.5 text-xs text-[var(--text-secondary)]">
									This note is required for audit trail.
								</p>
							</div>

							<div className="modal-actions mt-6 flex gap-3">
								<button
									type="button"
									onClick={() => {
										setIsUnsubscribeModalOpen(false);
										setMemberToUnsubscribe(null);
										setUnsubscribeReason('');
									}}
									disabled={isUnsubscribing}
									className="btn-secondary flex-1 rounded-xl px-4 py-3 font-semibold disabled:opacity-60"
								>
									Cancel
								</button>
								<button
									type="button"
									className="flex-1 rounded-xl border border-[#DC2626] bg-[#DC2626] px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
									onClick={confirmUnsubscribe}
									disabled={isUnsubscribing}
								>
									{isUnsubscribing ? 'Processing...' : 'Unsubscribe'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Renew Confirmation Modal */}
			{memberToRenew && (
				<div
					className={`modal-overlay ${isRenewModalOpen ? 'active' : ''}`}
					onClick={() => {
						setIsRenewModalOpen(false);
						setMemberToRenew(null);
					}}
				>
					<div className="modal modal-center" onClick={(e) => e.stopPropagation()}>
						<div className="modal-body">
							<div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
								<div
									className="modal-success-icon-large"
									style={{
										background: 'linear-gradient(135deg, var(--primary-red), var(--primary-yellow))',
									}}
								>
									<RotateCw size={48} style={{ color: 'white' }} />
								</div>
							</div>

							<h2 className="modal-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
								Renew Membership?
							</h2>

							<p className="modal-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>
								Renew <strong>{memberToRenew.name}</strong>'s subscription to{' '}
								<strong>{memberToRenew.membershipName}</strong>?
							</p>

							<div
								className="modal-actions"
								style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}
							>
								<button
									type="button"
									className="btn-secondary"
									onClick={() => {
										setIsRenewModalOpen(false);
										setMemberToRenew(null);
									}}
									disabled={isRenewing}
									style={{
										flex: 1,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '0.5rem',
										padding: '0.75rem 1.5rem',
										borderRadius: '0.75rem',
										fontWeight: '600',
										transition: 'all 0.2s',
										cursor: isRenewing ? 'not-allowed' : 'pointer',
										opacity: isRenewing ? 0.6 : 1,
									}}
								>
									Cancel
								</button>
								<button
									type="button"
									className="btn-primary"
									onClick={confirmRenew}
									disabled={isRenewing}
									style={{
										flex: 1,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '0.5rem',
										padding: '0.75rem 1.5rem',
										borderRadius: '0.75rem',
										fontWeight: '600',
										transition: 'all 0.2s',
										cursor: isRenewing ? 'not-allowed' : 'pointer',
										opacity: isRenewing ? 0.6 : 1,
									}}
								>
									{isRenewing ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											Processing...
										</>
									) : (
										<>
											Renew
										</>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{expiredMemberModalName && (
				<div
					className="modal-overlay active"
					onClick={() => setExpiredMemberModalName(null)}
				>
					<div className="modal modal-center" onClick={(e) => e.stopPropagation()}>
						<div className="modal-body">
							<div style={{ textAlign: 'center', marginBottom: '1rem' }}>
								<div className="modal-success-icon-large bg-[rgba(245,158,11,0.16)] border border-[rgba(245,158,11,0.35)]">
									<Clock size={40} className="text-amber-400" />
								</div>
							</div>
							<h2 className="modal-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
								Membership ended
							</h2>
							<p className="modal-text" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
								{expiredMemberModalName}&apos;s membership has just expired. You can renew from Member Management.
							</p>
							<div className="modal-actions" style={{ display: 'flex', justifyContent: 'center' }}>
								<button
									type="button"
									className="btn-primary"
									onClick={() => setExpiredMemberModalName(null)}
								>
									Got it
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function MemberViewModal({ member, onClose }: { member: Member; onClose: () => void }) {
	// Fetch detailed member data including coach and session information
	const { data: memberData, loading: memberLoading } = useQuery(GET_USER, {
		variables: { id: member.id },
		skip: !member.id,
	});

	// Fetch all coaches to match with coach IDs
	const { data: coachesData } = useQuery(GET_USERS, {
		variables: { role: 'coach' as any },
		skip: !memberData?.getUser?.membershipDetails?.coachesIds || 
			memberData?.getUser?.membershipDetails?.coachesIds?.length === 0,
	});

	const memberDetails = memberData?.getUser;
	const coachesIds = memberDetails?.membershipDetails?.coachesIds || [];
	const assignedCoaches = coachesData?.getUsers?.filter((coach: any) =>
		coachesIds.includes(coach.id)
	) || [];

	return (
		<div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
			<div className="modal-header">
				<h3>
					<Eye className="w-5 h-5" />
					View Member
				</h3>
				<button className="modal-close" onClick={onClose} title="Close" aria-label="Close">
					<X className="w-5 h-5" />
				</button>
			</div>
			<div className="modal-body max-h-[calc(100vh-200px)] overflow-y-auto">
				{memberLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="w-8 h-8 animate-spin text-[var(--primary-yellow)]" />
					</div>
				) : (
					<div className="space-y-6">
						{/* Basic Information Grid */}
						<div className="grid grid-cols-2 gap-6">
					{/* Personal Information */}
					<div>
						<h3 className="font-semibold mb-3 text-[var(--text-primary)]">Personal Information</h3>
						<div className="space-y-2 text-sm">
							<div>
								<span className="text-[var(--text-secondary)]">Full Name:</span>{' '}
								<span className="font-medium text-[var(--text-primary)]">{member.name}</span>
							</div>
							<div>
								<span className="text-[var(--text-secondary)]">First Name:</span>{' '}
								<span className="font-medium text-[var(--text-primary)]">{member.firstName}</span>
							</div>
							{member.middleName && (
								<div>
									<span className="text-[var(--text-secondary)]">Middle Name:</span>{' '}
									<span className="font-medium text-[var(--text-primary)]">
										{member.middleName}
									</span>
								</div>
							)}
							<div>
								<span className="text-[var(--text-secondary)]">Last Name:</span>{' '}
								<span className="font-medium text-[var(--text-primary)]">{member.lastName}</span>
							</div>
							<div>
								<span className="text-[var(--text-secondary)]">Email:</span>{' '}
								<span className="font-medium text-[var(--text-primary)]">{member.email}</span>
							</div>
							<div>
								<span className="text-[var(--text-secondary)]">Phone:</span>{' '}
								<span className="font-medium text-[var(--text-primary)]">{member.phone}</span>
							</div>
							<div>
								<span className="text-[var(--text-secondary)]">Date of Birth:</span>{' '}
								<span className="font-medium text-[var(--text-primary)]">
									{member.dateOfBirth && member.dateOfBirth !== 'N/A'
										? new Date(member.dateOfBirth).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'long',
												day: 'numeric',
											})
										: 'N/A'}
								</span>
							</div>
							<div>
								<span className="text-[var(--text-secondary)]">Gender:</span>{' '}
								<span className="font-medium text-[var(--text-primary)]">
									{member.gender || 'N/A'}
								</span>
							</div>
						</div>
					</div>

					{/* Membership & Subscription */}
					<div>
						<h3 className="font-semibold mb-3 text-[var(--text-primary)]">
							Membership & Subscription
						</h3>
						<div className="space-y-2 text-sm">
							<div>
								<span className="text-[var(--text-secondary)]">Membership Plan:</span>{' '}
								<span className="font-medium text-[var(--text-primary)]">{member.membership}</span>
							</div>
							<div>
								<span className="text-[var(--text-secondary)]">Status:</span>{' '}
								<span
									className={`font-medium ${
										member.status === 'Active' ? 'text-[#10B981]' : 'text-[var(--text-primary)]'
									}`}
								>
									{member.status}
								</span>
							</div>
							{member.durationType && (
								<div>
									<span className="text-[var(--text-secondary)]">Duration Type:</span>{' '}
									<span className="font-medium text-[var(--text-primary)]">
										{member.durationType}
									</span>
								</div>
							)}
							{member.subscriptionUsesDays ||
							memberDetails?.currentMembership?.dayDuration != null ||
							memberDetails?.currentMembership?.membership?.durationType === 'DAILY' ? (
								<div>
									<span className="text-[var(--text-secondary)]">Subscription length:</span>{' '}
									<span className="font-medium text-[var(--text-primary)]">
										{(() => {
											const d =
												memberDetails?.currentMembership?.dayDuration ??
												member.subscriptionDayDuration ??
												1;
											return `${d} day${d === 1 ? '' : 's'}`;
										})()}
									</span>
								</div>
							) : (member.subscriptionMonthDuration != null && member.subscriptionMonthDuration >= 1) ||
							  (memberDetails?.currentMembership?.monthDuration != null &&
									memberDetails.currentMembership.monthDuration >= 1) ? (
								<div>
									<span className="text-[var(--text-secondary)]">Subscription length:</span>{' '}
									<span className="font-medium text-[var(--text-primary)]">
										{memberDetails?.currentMembership?.monthDuration ??
											member.subscriptionMonthDuration}{' '}
										month
										{(memberDetails?.currentMembership?.monthDuration ??
											member.subscriptionMonthDuration) !== 1
											? 's'
											: ''}
									</span>
								</div>
							) : null}
							{member.startDate && (
								<div>
									<span className="text-[var(--text-secondary)]">Start Date:</span>{' '}
									<span className="font-medium text-[var(--text-primary)]">
										{new Date(member.startDate).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									</span>
								</div>
							)}
							{member.expiresAt && member.status === 'Active' && (
								<div>
									<span className="text-[var(--text-secondary)]">Expires:</span>{' '}
									<span className="font-medium text-[var(--text-primary)]">
										{member.endDate || new Date(member.expiresAt).toLocaleDateString('en-US', { 
											month: 'short', 
											day: 'numeric',
											year: 'numeric' 
										})}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Fitness Goals & Preferences */}
					<div>
						<h3 className="font-semibold mb-3 text-[var(--text-primary)]">
							Fitness Goals & Preferences
						</h3>
						<div className="space-y-2 text-sm">
							<div>
								<span className="text-[var(--text-secondary)]">Fitness Goals:</span>{' '}
								<span className="font-medium text-[var(--text-primary)]">
									{member.fitnessGoals || 'N/A'}
								</span>
							</div>
						</div>
					</div>

					{/* Account Information */}
					<div>
						<h3 className="font-semibold mb-3 text-[var(--text-primary)]">Account Information</h3>
						<div className="space-y-2 text-sm">
							<div>
								<span className="text-[var(--text-secondary)]">Member ID:</span>{' '}
								<span className="font-medium text-[var(--text-primary)] font-mono text-xs">
									{member.id}
								</span>
							</div>
							<div>
								<span className="text-[var(--text-secondary)]">Join Date:</span>{' '}
								<span className="font-medium text-[var(--text-primary)]">{member.joinDate}</span>
							</div>
							{member.transactionId && (
								<div>
									<span className="text-[var(--text-secondary)]">Transaction ID:</span>{' '}
									<span className="font-medium text-[var(--text-primary)] font-mono text-xs">
										{member.transactionId}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>

						{/* Assigned Coaches Section */}
						{assignedCoaches.length > 0 && (
							<div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
								<h3 className="font-semibold mb-4 text-[var(--text-primary)] flex items-center gap-2">
									<UserCog className="w-5 h-5 text-[var(--primary-yellow)]" />
									Assigned Coaches
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{assignedCoaches.map((coach: any) => (
										<div
											key={coach.id}
											className="p-4 bg-[rgba(255,255,255,0.03)] border border-[var(--card-border)] rounded-lg"
										>
											<div className="flex items-center gap-3 mb-2">
												<div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-red)] to-[var(--primary-yellow)] flex items-center justify-center text-white font-semibold text-sm">
													{coach.firstName?.[0] || ''}
													{coach.lastName?.[0] || ''}
												</div>
												<div>
													<p className="font-medium text-[var(--text-primary)]">
														{coach.firstName} {coach.lastName}
													</p>
													<p className="text-xs text-[var(--text-secondary)]">
														{coach.coachDetails?.specialization?.[0] || 'General Fitness'}
													</p>
												</div>
											</div>
											{coach.coachDetails?.specialization && coach.coachDetails.specialization.length > 1 && (
												<div className="mt-2 flex flex-wrap gap-1">
													{coach.coachDetails.specialization.slice(1).map((spec: string, idx: number) => (
														<span
															key={idx}
															className="text-xs px-2 py-1 bg-[rgba(249,197,19,0.1)] text-[var(--primary-yellow)] rounded"
														>
															{spec}
														</span>
													))}
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}

						{/* Progress & Goals Section */}
						<div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
							<h3 className="font-semibold mb-4 text-[var(--text-primary)] flex items-center gap-2">
								<TrendingUp className="w-5 h-5 text-[var(--primary-yellow)]" />
								Progress & Goals
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="p-4 bg-[rgba(255,255,255,0.03)] border border-[var(--card-border)] rounded-lg">
									<div className="flex items-center gap-3 mb-2">
										<Target className="w-5 h-5 text-[var(--primary-yellow)]" />
										<span className="text-sm font-medium text-[var(--text-secondary)]">Fitness Goal</span>
									</div>
									<p className="text-lg font-semibold text-[var(--text-primary)]">
										{memberDetails?.membershipDetails?.fitnessGoal || member.fitnessGoals || 'Not Set'}
									</p>
								</div>
								<div className="p-4 bg-[rgba(255,255,255,0.03)] border border-[var(--card-border)] rounded-lg">
									<div className="flex items-center gap-3 mb-2">
										<Dumbbell className="w-5 h-5 text-[var(--primary-yellow)]" />
										<span className="text-sm font-medium text-[var(--text-secondary)]">Physique Goal</span>
									</div>
									<p className="text-lg font-semibold text-[var(--text-primary)]">
										{memberDetails?.membershipDetails?.physiqueGoalType || 'Not Set'}
									</p>
								</div>
								<div className="p-4 bg-[rgba(255,255,255,0.03)] border border-[var(--card-border)] rounded-lg">
									<div className="flex items-center gap-3 mb-2">
										<Clock className="w-5 h-5 text-[var(--primary-yellow)]" />
										<span className="text-sm font-medium text-[var(--text-secondary)]">Workout Time</span>
									</div>
									<p className="text-lg font-semibold text-[var(--text-primary)]">
										{memberDetails?.membershipDetails?.workOutTime || 'Not Set'}
									</p>
								</div>
							</div>
							{member.progress && (
								<div className="mt-4 grid grid-cols-2 gap-4">
									<div className="p-4 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] rounded-lg">
										<div className="flex items-center gap-2 mb-1">
											<TrendingUp className="w-4 h-4 text-[#10B981]" />
											<span className="text-sm font-medium text-[var(--text-secondary)]">Weight Lost</span>
										</div>
										<p className="text-2xl font-bold text-[#10B981]">
											{member.progress.weightLost > 0 ? `${member.progress.weightLost} kg` : 'N/A'}
										</p>
									</div>
									<div className="p-4 bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] rounded-lg">
										<div className="flex items-center gap-2 mb-1">
											<Activity className="w-4 h-4 text-[#3B82F6]" />
											<span className="text-sm font-medium text-[var(--text-secondary)]">Workouts Completed</span>
										</div>
										<p className="text-2xl font-bold text-[#3B82F6]">
											{member.progress.workoutsCompleted || 0}
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Activities & Sessions Section */}
						<div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
							<h3 className="font-semibold mb-4 text-[var(--text-primary)] flex items-center gap-2">
								<Activity className="w-5 h-5 text-[var(--primary-yellow)]" />
								Activities & Sessions
							</h3>
							<div className="space-y-4">
								{/* Recent Activity Timeline */}
								<div className="space-y-3">
									<div className="flex items-start gap-4 p-4 bg-[rgba(255,255,255,0.03)] border border-[var(--card-border)] rounded-lg">
										<div className="w-2 h-2 rounded-full bg-[var(--primary-yellow)] mt-2"></div>
										<div className="flex-1">
											<p className="font-medium text-[var(--text-primary)]">Account Created</p>
											<p className="text-sm text-[var(--text-secondary)]">
												{member.joinDate || new Date(memberDetails?.createdAt || '').toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})}
											</p>
										</div>
									</div>
									{memberDetails?.currentMembership && (
										<div className="flex items-start gap-4 p-4 bg-[rgba(255,255,255,0.03)] border border-[var(--card-border)] rounded-lg">
											<div className="w-2 h-2 rounded-full bg-[#10B981] mt-2"></div>
											<div className="flex-1">
												<p className="font-medium text-[var(--text-primary)]">Membership Activated</p>
												<p className="text-sm text-[var(--text-secondary)]">
													{memberDetails.currentMembership.startedAt
														? new Date(memberDetails.currentMembership.startedAt).toLocaleDateString('en-US', {
																year: 'numeric',
																month: 'long',
																day: 'numeric',
															})
														: 'N/A'}
												</p>
												<p className="text-xs text-[var(--text-secondary)] mt-1">
													Plan: {memberDetails.currentMembership.membership?.name || 'N/A'}
												</p>
											</div>
										</div>
									)}
									{memberDetails?.membershipDetails?.hasEnteredDetails && (
										<div className="flex items-start gap-4 p-4 bg-[rgba(255,255,255,0.03)] border border-[var(--card-border)] rounded-lg">
											<div className="w-2 h-2 rounded-full bg-[#3B82F6] mt-2"></div>
											<div className="flex-1">
												<p className="font-medium text-[var(--text-primary)]">Profile Details Completed</p>
												<p className="text-sm text-[var(--text-secondary)]">
													Member has completed their profile setup
												</p>
											</div>
										</div>
									)}
									{assignedCoaches.length > 0 && (
										<div className="flex items-start gap-4 p-4 bg-[rgba(255,255,255,0.03)] border border-[var(--card-border)] rounded-lg">
											<div className="w-2 h-2 rounded-full bg-[var(--primary-yellow)] mt-2"></div>
											<div className="flex-1">
												<p className="font-medium text-[var(--text-primary)]">Coach Assigned</p>
												<p className="text-sm text-[var(--text-secondary)]">
													{assignedCoaches.length} coach{assignedCoaches.length > 1 ? 'es' : ''} assigned
												</p>
											</div>
										</div>
									)}
								</div>

								{/* Session Information Placeholder */}
								<div className="mt-4 p-4 bg-[rgba(255,255,255,0.02)] border border-[var(--card-border)] rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
										<span className="text-sm font-medium text-[var(--text-secondary)]">Session History</span>
									</div>
									<p className="text-sm text-[var(--text-secondary)]">
										Session logs and detailed workout history will be displayed here when available.
									</p>
								</div>
							</div>
						</div>

						{/* Additional Information */}
						<div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
							<h3 className="font-semibold mb-4 text-[var(--text-primary)] flex items-center gap-2">
								<FileText className="w-5 h-5 text-[var(--primary-yellow)]" />
								Additional Information
							</h3>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-[var(--text-secondary)]">Heard From:</span>{' '}
									<span className="font-medium text-[var(--text-primary)]">
										{memberDetails?.heardFrom || 'N/A'}
									</span>
								</div>
								<div>
									<span className="text-[var(--text-secondary)]">Profile Complete:</span>{' '}
									<span className="font-medium text-[var(--text-primary)]">
										{memberDetails?.membershipDetails?.hasEnteredDetails ? 'Yes' : 'No'}
									</span>
								</div>
								<div>
									<span className="text-[var(--text-secondary)]">Last Updated:</span>{' '}
									<span className="font-medium text-[var(--text-primary)]">
										{memberDetails?.updatedAt
											? new Date(memberDetails.updatedAt).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})
											: 'N/A'}
									</span>
								</div>
							</div>
						</div>
						{member.status === 'Disabled' ? (
							<div className="bg-[rgba(71,85,105,0.2)] border border-[rgba(148,163,184,0.35)] rounded-xl p-6">
								<h3 className="font-semibold mb-3 text-[var(--text-primary)]">
									Disabled Account Details
								</h3>
								<p className="text-sm text-[var(--text-secondary)]">
									<span className="text-[var(--text-primary)] font-medium">Reason:</span>{' '}
									{member.disableReason?.trim() || 'No reason provided'}
								</p>
								<p className="mt-1 text-sm text-[var(--text-secondary)]">
									<span className="text-[var(--text-primary)] font-medium">Disabled at:</span>{' '}
									{member.disabledAt
										? new Date(member.disabledAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })
										: 'N/A'}
								</p>
							</div>
						) : null}
					</div>
				)}
			</div>
			<div className="modal-footer">
				<button type="button" className="btn-secondary" onClick={onClose}>
					Close
				</button>
			</div>
		</div>
	);
}

