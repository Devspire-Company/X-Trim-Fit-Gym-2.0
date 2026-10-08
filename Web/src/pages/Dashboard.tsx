import { useEffect, useState, useMemo } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { Link } from 'react-router';
import {
	Users,
	UserCog,
	PhilippinePeso,
	CreditCard,
	BarChart3,
	Clock,
	LogIn,
	LogOut,
	Calendar,
	PieChart,
	UserRound,
	Zap,
} from 'lucide-react';
import {
	GET_USERS,
	GET_REVENUE_SUMMARY,
	REVENUE_SUMMARY_UPDATED,
	USERS_UPDATED,
	GET_ATTENDANCE_RECORDS,
	ATTENDANCE_RECORD_ADDED,
	ATTENDANCE_UPDATED,
	WALK_IN_STATS,
} from '@/graphql/operations/index';
import { RoleType } from '@/graphql/generated/graphql';
import { useNotifyMembershipExpiry } from '@/hooks/useNotifyMembershipExpiry';
import type { AttendanceRecord } from '@/graphql/generated/types';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	Filler
);

export function DashboardPage() {
	useEffect(() => {
		document.title = 'Admin Dashboard - X-TRIM FIT GYM';
	}, []);

	// Initial data fetch with queries
	const { data: membersData, loading: membersLoading } = useQuery(GET_USERS, {
		variables: { role: RoleType.Member },
		errorPolicy: 'none',
	});

	const { data: coachesData, loading: coachesLoading } = useQuery(GET_USERS, {
		variables: { role: RoleType.Coach },
		errorPolicy: 'none',
	});

	const { data: analyticsData } = useQuery(GET_REVENUE_SUMMARY, {
		errorPolicy: 'all',
		fetchPolicy: 'network-only',
	});

	const { data: walkInStatsData } = useQuery(WALK_IN_STATS, {
		errorPolicy: 'all',
		fetchPolicy: 'cache-and-network',
	});

	// Fetch recent attendance records
	const { data: attendanceData, loading: attendanceLoading } = useQuery(GET_ATTENDANCE_RECORDS, {
		variables: {
			pagination: {
				limit: 5,
				offset: 0,
			},
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
	});

	// Real-time subscriptions
	const { data: membersSubscriptionData } = useSubscription(USERS_UPDATED, {
		variables: { role: RoleType.Member },
		skip: !membersData, // Skip if initial data not loaded
	});

	const { data: coachesSubscriptionData } = useSubscription(USERS_UPDATED, {
		variables: { role: RoleType.Coach },
		skip: !coachesData, // Skip if initial data not loaded
	});

	const { data: revenueSubscriptionData } = useSubscription(REVENUE_SUMMARY_UPDATED, {
		skip: !analyticsData, // Skip if initial data not loaded
	});

	// Real-time attendance subscription
	const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
	const [subscriptionStatus, setSubscriptionStatus] = useState<string>('Initializing...');

	// Initialize attendance records from query
	useEffect(() => {
		if (attendanceData?.getAttendanceRecords?.records) {
			setRecentAttendance(attendanceData.getAttendanceRecords.records);
			console.log('[Dashboard] Initial attendance records loaded:', attendanceData.getAttendanceRecords.records.length);
		}
	}, [attendanceData]);

	// Log when component mounts to verify subscription is being set up
	useEffect(() => {
		console.log('[Dashboard] Component mounted, setting up attendance subscription...');
		setSubscriptionStatus('Setting up subscription...');
	}, []);

	// Subscribe to new attendance records - using both data and onData for immediate updates
	const { data: attendanceSubscriptionData, error: attendanceSubError, loading: attendanceSubLoading } = useSubscription(ATTENDANCE_RECORD_ADDED, {
		skip: false, // Always subscribe
		shouldResubscribe: true, // Re-subscribe if connection is lost
		onData: ({ data: subData, error: subError }: { data?: unknown; error?: Error }) => {
			console.log('[Dashboard Attendance Subscription] 📨 onData called:', { 
				subData, 
				subError,
				hasData: !!subData,
				dataKeys: subData ? Object.keys(subData as object) : [],
				fullData: JSON.stringify(subData, null, 2),
			});
			setSubscriptionStatus('Data received');
			if (subError) {
				console.error('[Dashboard Attendance Subscription] ❌ Error in onData:', subError);
				return;
			}
			// Try multiple paths to get the record
			// Try multiple paths to extract the record
			let newRecord = null;
			
			// Path 1: Standard GraphQL subscription response
			const subDataObj = subData as { data?: { attendanceRecordAdded?: unknown }; attendanceRecordAdded?: unknown };
			if (subDataObj?.data?.attendanceRecordAdded) {
				newRecord = subDataObj.data.attendanceRecordAdded;
				console.log('[Dashboard Attendance Subscription] ✅ Found record in subData.data.attendanceRecordAdded');
			}
			// Path 2: Direct property
			else if (subDataObj?.attendanceRecordAdded) {
				newRecord = subDataObj.attendanceRecordAdded;
				console.log('[Dashboard Attendance Subscription] ✅ Found record in subData.attendanceRecordAdded');
			}
			// Path 3: Check if subData itself is the record
			else if (subData && typeof subData === 'object' && 'id' in subData && 'personName' in subData) {
				newRecord = subData;
				console.log('[Dashboard Attendance Subscription] ✅ subData itself is the record');
			}
			// Path 4: Check nested structures
			else if ((subData as any)?.attendanceRecordAdded) {
				newRecord = (subData as any).attendanceRecordAdded;
				console.log('[Dashboard Attendance Subscription] ✅ Found record in nested structure');
			}
			
			console.log('[Dashboard Attendance Subscription] Extracted record:', newRecord);
			console.log('[Dashboard Attendance Subscription] Full subData structure:', JSON.stringify(subData, null, 2));
			
			if (newRecord) {
				console.log('[Dashboard Attendance Subscription] ✅ New record received in onData:', newRecord);
				setSubscriptionStatus(`New record: ${newRecord.personName}`);
				// Use functional update to ensure state is updated correctly
				setRecentAttendance((prevRecords) => {
					// Check if record already exists
					const exists = prevRecords.some(
						(r) => r.id === newRecord.id && r.authDateTime === newRecord.authDateTime
					);
					if (exists) {
						console.log('[Dashboard Attendance Subscription] ⚠️ Record already exists, skipping');
						return prevRecords;
					}
					console.log('[Dashboard Attendance Subscription] ✅ Adding new record to list (prev count:', prevRecords.length, ')');
					// Add new record at the beginning (most recent first) and force re-render
					const updated = [newRecord, ...prevRecords].slice(0, 5);
					console.log('[Dashboard Attendance Subscription] ✅ Updated list (new count:', updated.length, ')');
					return updated;
				});
			} else {
				console.warn('[Dashboard Attendance Subscription] ⚠️ No record found in data. Full subData:', JSON.stringify(subData, null, 2));
			}
		},
		onError: (error) => {
			console.error('[Dashboard Attendance Subscription] ❌ Subscription error:', error);
			setSubscriptionStatus(`Error: ${error.message || 'Unknown error'}`);
		},
		onComplete: () => {
			console.log('[Dashboard Attendance Subscription] Subscription completed');
			setSubscriptionStatus('Completed');
		},
	});

	// Log subscription status
	useEffect(() => {
		const status = {
			loading: attendanceSubLoading,
			hasData: !!attendanceSubscriptionData,
			error: attendanceSubError,
			data: attendanceSubscriptionData,
		};
		console.log('[Dashboard Attendance Subscription] Status:', status);
		
		if (attendanceSubLoading) {
			setSubscriptionStatus('Connecting...');
		} else if (attendanceSubError) {
			setSubscriptionStatus(`Error: ${attendanceSubError.message || 'Unknown'}`);
		} else if (attendanceSubscriptionData) {
			setSubscriptionStatus('Connected and waiting for data');
		} else {
			setSubscriptionStatus('Connected');
		}
	}, [attendanceSubLoading, attendanceSubscriptionData, attendanceSubError]);

	// Also handle subscription data property for additional updates
	useEffect(() => {
		if (attendanceSubscriptionData?.attendanceRecordAdded) {
			const newRecord = attendanceSubscriptionData.attendanceRecordAdded;
			console.log('[Dashboard Attendance Subscription] ✅ New record from data property:', newRecord);
			setSubscriptionStatus(`New record from data: ${newRecord.personName}`);
			setRecentAttendance((prevRecords) => {
				const exists = prevRecords.some(
					(r) => r.id === newRecord.id && r.authDateTime === newRecord.authDateTime
				);
				if (exists) {
					console.log('[Dashboard Attendance Subscription] ⚠️ Record already exists (from data property)');
					return prevRecords;
				}
				console.log('[Dashboard Attendance Subscription] ✅ Adding record from data property');
				return [newRecord, ...prevRecords].slice(0, 5);
			});
		}
	}, [attendanceSubscriptionData]);

	// Also subscribe to batch updates
	const { data: batchSubscriptionData, error: batchSubError } = useSubscription(ATTENDANCE_UPDATED, {
		skip: false,
		onData: ({ data: subData, error: subError }: { data?: { data?: { attendanceUpdated?: AttendanceRecord[] } }; error?: Error }) => {
			console.log('[Dashboard Attendance Batch Subscription] 📨 onData called:', { subData, subError });
			if (subError) {
				console.error('[Dashboard Attendance Batch Subscription] ❌ Error in onData:', subError);
				return;
			}
			const batchData = subData?.data?.attendanceUpdated;
			if (batchData && batchData.length > 0) {
				const newRecords = batchData;
				console.log('[Dashboard Attendance Batch Subscription] ✅ New records received:', newRecords.length);
				setRecentAttendance((prevRecords) => {
					// Merge new records, avoiding duplicates
					const existingIds = new Set(
						prevRecords.map((r) => `${r.id}-${r.authDateTime}`)
					);
					const uniqueNewRecords = newRecords.filter(
						(r: AttendanceRecord) => !existingIds.has(`${r.id}-${r.authDateTime}`)
					);
					if (uniqueNewRecords.length > 0) {
						console.log('[Dashboard Attendance Batch Subscription] ✅ Adding', uniqueNewRecords.length, 'new records');
						return [...uniqueNewRecords, ...prevRecords].slice(0, 5); // Keep only 5 most recent
					}
					return prevRecords;
				});
			}
		},
		onError: (error) => {
			console.error('[Dashboard Attendance Batch Subscription] ❌ Subscription error:', error);
		},
	});

	// Also handle batch subscription data property
	useEffect(() => {
		if (batchSubscriptionData?.attendanceUpdated && batchSubscriptionData.attendanceUpdated.length > 0) {
			const newRecords = batchSubscriptionData.attendanceUpdated;
			console.log('[Dashboard Attendance Batch Subscription] ✅ New records from data property:', newRecords.length);
			setRecentAttendance((prevRecords) => {
				const existingIds = new Set(
					prevRecords.map((r) => `${r.id}-${r.authDateTime}`)
				);
				const uniqueNewRecords = newRecords.filter(
					(r) => !existingIds.has(`${r.id}-${r.authDateTime}`)
				);
				if (uniqueNewRecords.length > 0) {
					return [...uniqueNewRecords, ...prevRecords].slice(0, 5);
				}
				return prevRecords;
			});
		}
	}, [batchSubscriptionData]);

	const mergedMembersList = useMemo(() => {
		const queriedMembers = (membersData?.getUsers || []) as any[];
		const subscribedMembers = (membersSubscriptionData?.usersUpdated || []) as any[];
		if (subscribedMembers.length === 0) return queriedMembers;
		const mergedById = new Map<string, any>();
		queriedMembers.forEach((member) => mergedById.set(member.id, member));
		subscribedMembers.forEach((member) => {
			const previous = mergedById.get(member.id) || {};
			mergedById.set(member.id, { ...previous, ...member });
		});
		return Array.from(mergedById.values());
	}, [membersData?.getUsers, membersSubscriptionData?.usersUpdated]);

	useNotifyMembershipExpiry(mergedMembersList, membersLoading);

	// Only block on members and coaches loading - analytics can load in background
	const loading = membersLoading || coachesLoading;
	const error = null; // Handle errors separately if needed
	
	// Use subscription data if available, otherwise fall back to query data
	const data = {
		members: mergedMembersList,
		coaches: coachesSubscriptionData?.usersUpdated || coachesData?.getUsers || [],
	};
	
	// Use subscription data for analytics if available, otherwise fall back to query data
	const analytics = revenueSubscriptionData?.revenueSummaryUpdated || analyticsData?.getRevenueSummary;

	// Show loading state
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-yellow)] mx-auto mb-4"></div>
					<p className="text-[var(--text-secondary)]">Loading dashboard...</p>
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
						<svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Unable to Load Dashboard</h2>
					<p className="text-[var(--text-secondary)] mb-4">
						{(error as Error | null)?.message || 'Failed to connect to the server'}
					</p>
					<button 
						onClick={() => window.location.reload()} 
						className="btn-primary"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	const members = (data?.members || []).map((m: any) => {
		// IMPORTANT: Only use currentMembership which only returns ACTIVE transactions
		// Do NOT use membershipDetails.membershipTransaction as it may include canceled/expired transactions
		const membershipTransaction = m.currentMembership;
		// Only consider it active if the transaction exists and status is ACTIVE
		const isActive = membershipTransaction?.status === 'ACTIVE';
		return {
			id: m.id,
			name: `${m.firstName} ${m.lastName}`,
			email: m.email,
			phone: m.phoneNumber || 'N/A',
			membership: isActive ? (membershipTransaction?.membership?.name || 'No Plan') : 'No Plan',
			status: isActive ? 'Active' : 'Inactive',
			joinDate: m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A',
			avatar: `${m.firstName?.[0] || ''}${m.lastName?.[0] || ''}`,
			// Only include price if transaction is ACTIVE
			monthlyPrice: isActive ? (membershipTransaction?.membership?.monthlyPrice || 0) : 0,
			progress: {
				weightLost: 0,
				workoutsCompleted: 0,
			},
		};
	});

	const coaches = (data?.coaches || []).map((c: any) => ({
		id: c.id,
		name: `${c.firstName} ${c.lastName}`,
		email: c.email,
		phone: c.phoneNumber || 'N/A',
		specialization: c.coachDetails?.specialization?.[0] || 'General Fitness',
		yearsExperience: c.coachDetails?.yearsOfExperience?.toString() || '0',
		status: 'Active',
		avatar: `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`,
		totalClients: c.coachDetails?.clientsIds?.length || 0,
		rating: c.coachDetails?.ratings || 5.0,
	}));

	// Calculate stats
	const totalMembers = members.length;
	const totalCoaches = coaches.length;
	
	const monthlyRevenue = analytics?.totalRevenue || 0;
	const membershipRev = analytics?.membershipSubscriptionRevenue ?? 0;
	const walkInRev = analytics?.walkInRevenue ?? 0;
	const activeSubscriptions = analytics?.activeSubscriptions || 0;
	const totalWalkInTimeIns = walkInStatsData?.walkInStats?.totalTimeInRecords ?? 0;
	const totalWalkInAccounts = walkInStatsData?.walkInStats?.totalWalkInAccounts ?? 0;

	// Recent members (last 3) - sort by join date
	const recentMembers = [...members]
		.sort((a, b) => {
			const dateA = new Date(data.members.find((m: any) => m.id === a.id)?.createdAt || 0).getTime();
			const dateB = new Date(data.members.find((m: any) => m.id === b.id)?.createdAt || 0).getTime();
			return dateB - dateA;
		})
		.slice(0, 3);

	// Membership distribution - group by actual membership names
	const membershipTypes = [...new Set(members.map(m => m.membership))];
	const membershipDistribution: Record<string, number> = {};
	membershipTypes.forEach(type => {
		membershipDistribution[type] = members.filter((m) => m.membership === type).length;
	});

	return (
		<div className="space-y-6">
			{/* Welcome Section */}
			<div className="welcome-section relative rounded-[20px] overflow-hidden p-10">
				<div className="welcome-bg-image"></div>
				<div className="welcome-content relative z-10 flex items-center justify-between">
					<div>
						<h1 className="text-[2.2rem] font-bold mb-2 gradient-text">Welcome Back, Admin!</h1>
						<p className="text-[var(--text-secondary)] text-[1.05rem]">
							Manage your gym operations, members, coaches, and track your business performance.
						</p>
					</div>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
				<StatCard
					icon={PhilippinePeso}
					title="Total revenue"
					value={`₱${monthlyRevenue.toLocaleString()}`}
					change="Membership + walk-in fees"
					changeType="positive"
				/>
				<StatCard
					icon={UserCog}
					title="Total Coaches"
					value={totalCoaches}
					change="Active coaches"
					changeType="neutral"
				/>
				<StatCard
					icon={Users}
					title="Total Members"
					value={totalMembers}
					change={`+${members.filter((m) => m.joinDate === 'November 2024').length} this month`}
					changeType="positive"
				/>
				<StatCard
					icon={UserRound}
					title="Total walk-ins"
					value={totalWalkInTimeIns}
					change={
						totalWalkInAccounts > 0
							? `${totalWalkInAccounts} walk-in account${totalWalkInAccounts === 1 ? '' : 's'} · ₱${Number(walkInRev).toLocaleString()} fees`
							: `₱${Number(walkInRev).toLocaleString()} walk-in fees`
					}
					changeType="positive"
				/>
				<StatCard
					icon={CreditCard}
					title="Active Subscriptions"
					value={activeSubscriptions}
					change="All active"
					changeType="neutral"
				/>
			</div>

			{/* Revenue Overview Chart - Full Width */}
			<div className="section-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] p-7 backdrop-blur-md">
				<h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-[var(--text-primary)] font-['Poppins']">
					<BarChart3 className="inline w-5 h-5 text-[var(--primary-yellow)] mr-1.5 align-[-0.125em]" aria-hidden />
					Revenue Overview
				</h2>
				
				{/* Revenue Chart */}
				{analytics?.revenueByPeriod && analytics.revenueByPeriod.length > 0 ? (
					<div className="mb-6">
						<RevenueChart
							data={analytics.revenueByPeriod as Array<{
								period: string;
								revenue: number;
								count: number;
								walkInRevenue?: number;
								walkInCount?: number;
							}>}
						/>
					</div>
				) : (
					<div className="mb-6 h-80 flex items-center justify-center text-[var(--text-secondary)]">
						<p>No revenue data available</p>
					</div>
				)}

				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
					<div className="flex flex-col">
						<span className="text-sm text-[var(--text-secondary)] mb-1">Total</span>
						<span className="text-lg font-semibold text-[var(--text-primary)] font-['Inter',ui-sans-serif,system-ui,sans-serif] tabular-nums">
							₱{monthlyRevenue.toLocaleString()}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-sm text-[var(--text-secondary)] mb-1">Membership sales</span>
						<span className="text-lg font-semibold text-[var(--text-primary)] font-['Inter',ui-sans-serif,system-ui,sans-serif] tabular-nums">
							₱{membershipRev.toLocaleString()}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-sm text-[var(--text-secondary)] mb-1">Walk-in fees</span>
						<span className="text-lg font-semibold text-[var(--text-primary)] font-['Inter',ui-sans-serif,system-ui,sans-serif] tabular-nums">
							₱{walkInRev.toLocaleString()}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-sm text-[var(--text-secondary)] mb-1">Active Subscriptions</span>
						<span className="text-lg font-semibold text-[var(--text-primary)] font-['Poppins']">
							{activeSubscriptions}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-sm text-[var(--text-secondary)] mb-1">New This Period</span>
						<span className="text-lg font-semibold text-[var(--primary-yellow)] font-['Poppins']">
							+{analytics?.newSubscriptions || 0}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-sm text-[var(--text-secondary)] mb-1">Avg. sub / member</span>
						<span className="text-lg font-semibold text-[var(--text-primary)] font-['Inter',ui-sans-serif,system-ui,sans-serif] tabular-nums">
							₱
							{activeSubscriptions > 0 ? Math.round(membershipRev / activeSubscriptions) : 0}
						</span>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="section-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] p-7 backdrop-blur-md">
				<h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)] font-['Poppins']">
					<Zap className="w-5 h-5 text-[var(--primary-yellow)]" aria-hidden />
					Quick Actions
				</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<QuickActionButton href="/members" icon={Users} label="Add Member" />
					<QuickActionButton href="/coaches" icon={UserCog} label="Add Coach" />
					<QuickActionButton href="/memberships" icon={CreditCard} label="Manage Plans" />
					<QuickActionButton href="/reports" icon={BarChart3} label="View Reports" />
				</div>
			</div>

			{/* Recent Attendance Logs - Full Width */}
			<div className="section-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] p-7 backdrop-blur-md">
				<div className="section-header flex items-center justify-between mb-6 pb-4 border-b border-[rgba(255,255,255,0.08)]">
					<h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)] font-['Poppins']">
						<Clock className="w-5 h-5 text-[var(--primary-yellow)]" />
						Recent Attendance Logs
						<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2" title="Real-time updates active"></span>
						{(attendanceSubError || batchSubError) && (
							<span className="text-xs text-red-400 ml-2" title="Subscription error">
								⚠️ Connection issue
							</span>
						)}
						<span className="text-xs text-[var(--text-secondary)] ml-2" title={`Status: ${subscriptionStatus}`}>
							({subscriptionStatus})
						</span>
					</h2>
					<Link
						to="/attendance"
						className="view-all text-sm text-[var(--primary-yellow)] font-medium flex items-center gap-1"
					>
						View All <span>→</span>
					</Link>
				</div>
				{attendanceLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-yellow)]"></div>
					</div>
				) : recentAttendance.length > 0 ? (
					<div className="space-y-3">
						{recentAttendance.map((record) => (
							<div
								key={`${record.id}-${record.authDateTime}`}
								className="attendance-item flex items-center gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
							>
								<div
									className={`attendance-icon w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
										record.direction === 'IN'
											? 'bg-green-500/20 border-2 border-green-500/50'
											: 'bg-red-500/20 border-2 border-red-500/50'
									}`}
								>
									{record.direction === 'IN' ? (
										<LogIn className="w-6 h-6 text-green-400" />
									) : (
										<LogOut className="w-6 h-6 text-red-400" />
									)}
								</div>
								<div className="attendance-info flex-1 min-w-0">
									<h3 className="font-semibold text-[var(--text-primary)] mb-1 truncate">
										{record.personName}
									</h3>
									<div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
										<span className="flex items-center gap-1">
											<Clock className="w-3 h-3" />
											{record.authTime}
										</span>
										<span className="flex items-center gap-1">
											<Calendar className="inline w-3.5 h-3.5 mr-1 align-[-0.125em] text-[var(--primary-yellow)]" aria-hidden />
											{record.authDate}
										</span>
										{record.deviceName && (
											<span className="text-xs opacity-75">• {record.deviceName}</span>
										)}
									</div>
								</div>
								<div className="attendance-direction flex-shrink-0">
									<span
										className={`px-3 py-1 rounded-full text-xs font-semibold ${
											record.direction === 'IN'
												? 'bg-green-500/20 text-green-400 border border-green-500/50'
												: 'bg-red-500/20 text-red-400 border border-red-500/50'
										}`}
									>
										{record.direction}
									</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-8 text-[var(--text-secondary)]">
						<p>No attendance records yet</p>
					</div>
				)}
			</div>

			{/* Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Members */}
				<div className="section-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] p-7 backdrop-blur-md">
					<div className="section-header flex items-center justify-between mb-6 pb-4 border-b border-[rgba(255,255,255,0.08)]">
						<h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)] font-['Poppins']">
							<Users className="w-5 h-5 text-[var(--primary-yellow)]" />
							Recent Members
						</h2>
						<Link
							to="/members"
							className="view-all text-sm text-[var(--primary-yellow)] font-medium flex items-center gap-1"
						>
							View All <span>→</span>
						</Link>
					</div>
					<div className="space-y-4">
						{recentMembers.map((member) => (
							<div
								key={member.id}
								className="member-item flex items-center gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]"
							>
								<div className="member-avatar w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary-red)] to-[var(--primary-yellow)] flex items-center justify-center font-semibold text-white text-base flex-shrink-0">
									{member.avatar}
								</div>
								<div className="member-info flex-1">
									<h3 className="font-semibold text-[var(--text-primary)] mb-1">{member.name}</h3>
									<p className="text-sm text-[var(--text-secondary)]">
										{member.membership} Member • Joined {member.joinDate}
									</p>
								</div>
								<button className="btn-small text-sm text-[var(--primary-yellow)] bg-[rgba(249,197,19,0.1)] border border-[rgba(249,197,19,0.3)] px-4 py-2 rounded-lg font-semibold">
									View
								</button>
							</div>
						))}
					</div>
				</div>

				{/* Coaches */}
				<div className="section-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] p-7 backdrop-blur-md">
					<div className="section-header flex items-center justify-between mb-6 pb-4 border-b border-[rgba(255,255,255,0.08)]">
						<h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--text-primary)] font-['Poppins']">
							<UserCog className="w-5 h-5 text-[var(--primary-yellow)]" />
							Coaches
						</h2>
						<Link
							to="/coaches"
							className="view-all text-sm text-[var(--primary-yellow)] font-medium flex items-center gap-1"
						>
							View All <span>→</span>
						</Link>
					</div>
					<div className="space-y-4">
						{coaches.map((coach) => (
							<div
								key={coach.id}
								className="coach-item flex items-center gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]"
							>
								<div className="coach-avatar w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary-red)] to-[var(--primary-yellow)] flex items-center justify-center font-semibold text-white text-base flex-shrink-0">
									{coach.avatar}
								</div>
								<div className="coach-info flex-1">
									<h3 className="font-semibold text-[var(--text-primary)] mb-1">{coach.name}</h3>
									<p className="text-sm text-[var(--text-secondary)]">
										{coach.specialization} • {coach.yearsExperience} years experience
									</p>
								</div>
								<button className="btn-small text-sm text-[var(--primary-yellow)] bg-[rgba(249,197,19,0.1)] border border-[rgba(249,197,19,0.3)] px-4 py-2 rounded-lg font-semibold">
									View
								</button>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Membership Distribution - Full Width */}
			<div className="section-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] p-7 backdrop-blur-md">
				<h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)] font-['Poppins']">
					<PieChart className="inline w-5 h-5 text-[var(--primary-yellow)] mr-1.5 align-[-0.125em]" aria-hidden />
					Membership Distribution
				</h2>
				<div className="membership-distribution space-y-3">
					{Object.entries(membershipDistribution).map(([name, count]) => {
						const percentage = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;
						return (
							<div
								key={name}
								className="membership-item flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]"
							>
								<div className="membership-info flex items-center gap-3">
									<div
										className={`membership-color w-4 h-4 rounded ${
											name === 'Student'
												? 'bg-[var(--primary-gray)]'
												: name === 'PROMO Student'
													? 'bg-gradient-to-br from-[var(--primary-red)] to-[var(--primary-yellow)]'
													: 'bg-gradient-to-br from-[#8B4513] to-[#A0522D]'
										}`}
									/>
									<span className="membership-name font-medium text-[var(--text-primary)]">
										{name}
									</span>
								</div>
								<div className="membership-stats flex flex-col items-end gap-1">
									<span className="membership-count font-bold text-[var(--text-primary)] font-['Poppins']">
										{count}
									</span>
									<span className="membership-percentage text-sm text-[var(--text-secondary)]">
										{percentage}%
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function StatCard({
	icon: Icon,
	title,
	value,
	change,
	changeType,
}: {
	icon: typeof Users;
	title: string;
	value: string | number;
	change: string;
	changeType: 'positive' | 'negative' | 'neutral';
}) {
	return (
		<div className="stat-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[18px] p-7 backdrop-blur-md">
			<div className="flex items-center justify-between mb-6">
				<div className="stat-icon w-14 h-14 rounded-[14px] bg-gradient-to-br from-[rgba(249,197,19,0.15)] to-[rgba(228,30,38,0.1)] flex items-center justify-center text-[1.6rem] text-[var(--primary-yellow)]">
					<Icon className="w-6 h-6" />
				</div>
			</div>
			<h3 className="text-[0.85rem] font-medium text-[var(--text-secondary)] mb-2 uppercase">
				{title}
			</h3>
			<div className="stat-value text-[2.2rem] font-bold tracking-tight text-[var(--text-primary)] mb-2 font-['Inter',ui-sans-serif,system-ui,sans-serif] tabular-nums">
				{value}
			</div>
			<div
				className={`stat-change text-[0.8rem] font-semibold flex items-center gap-1 ${
					changeType === 'positive'
						? 'text-[var(--primary-yellow)]'
						: changeType === 'negative'
							? 'text-[#EF4444]'
							: 'text-[var(--text-secondary)]'
				}`}
			>
				{change}
			</div>
		</div>
	);
}

function QuickActionButton({
	href,
	icon: Icon,
	label,
}: {
	href: string;
	icon: typeof Users;
	label: string;
}) {
	return (
		<Link
			to={href}
			className="quick-action-btn flex flex-row items-center justify-center gap-3 p-5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-[var(--text-primary)] text-[0.9rem] font-medium"
		>
			<Icon className="w-5 h-5 text-[var(--primary-yellow)] flex-shrink-0" />
			<span className="whitespace-nowrap">{label}</span>
		</Link>
	);
}

function RevenueChart({
	data,
}: {
	data: Array<{
		period: string;
		revenue: number;
		count: number;
		walkInRevenue?: number;
		walkInCount?: number;
	}>;
}) {
	const subDaily = data.map((item) =>
		Math.max(0, item.revenue - (item.walkInRevenue ?? 0)),
	);
	const walkDaily = data.map((item) => item.walkInRevenue ?? 0);

	const chartData = {
		labels: data.map((item) => item.period),
		datasets: [
			{
				label: 'Membership (new sales, day)',
				data: subDaily,
				borderColor: 'rgba(249, 197, 19, 1)',
				backgroundColor: 'rgba(249, 197, 19, 0.12)',
				borderWidth: 2,
				fill: true,
				tension: 0.35,
				pointRadius: 4,
				pointHoverRadius: 6,
			},
			{
				label: 'Walk-in fees (day)',
				data: walkDaily,
				borderColor: 'rgba(16, 185, 129, 1)',
				backgroundColor: 'rgba(16, 185, 129, 0.08)',
				borderWidth: 2,
				fill: true,
				tension: 0.35,
				pointRadius: 4,
				pointHoverRadius: 6,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: true,
				position: 'top' as const,
				labels: { color: 'rgba(184, 188, 200, 0.95)', boxWidth: 12 },
			},
			tooltip: {
				backgroundColor: 'rgba(19, 22, 31, 0.95)',
				titleColor: 'rgba(255, 255, 255, 1)',
				bodyColor: 'rgba(249, 197, 19, 1)',
				borderColor: 'rgba(249, 197, 19, 0.3)',
				borderWidth: 1,
				padding: 12,
				titleFont: {
					size: 14,
					weight: 600,
					family: "'Poppins', sans-serif",
				},
				bodyFont: {
					size: 13,
					weight: 500,
					family: "'Inter', sans-serif",
				},
				callbacks: {
					afterBody: function (items: any[]) {
						const i = items[0]?.dataIndex;
						if (i == null) return '';
						const total = (subDaily[i] ?? 0) + (walkDaily[i] ?? 0);
						return `Day total: ₱${total.toLocaleString()}`;
					},
					label: function (context: any) {
						return `${context.dataset.label}: ₱${context.parsed.y.toLocaleString()}`;
					},
				},
			},
		},
		scales: {
			x: {
				grid: {
					color: 'rgba(255, 255, 255, 0.05)',
					drawBorder: false,
				},
				ticks: {
					color: 'rgba(184, 188, 200, 0.8)',
					font: {
						size: 11,
						family: "'Inter', sans-serif",
					},
				},
			},
			y: {
				grid: {
					color: 'rgba(255, 255, 255, 0.05)',
					drawBorder: false,
				},
				ticks: {
					color: 'rgba(184, 188, 200, 0.8)',
					font: {
						size: 11,
						family: "'Inter', sans-serif",
					},
					callback: function (value: any) {
						return '₱' + (value / 1000).toFixed(0) + 'k';
					},
				},
			},
		},
	};

	return (
		<div className="h-80">
			<Line data={chartData} options={chartOptions} />
		</div>
	);
}
