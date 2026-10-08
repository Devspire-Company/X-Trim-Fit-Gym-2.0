import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Bell, X, Check, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import {
	GET_PENDING_SUBSCRIPTION_REQUESTS,
	APPROVE_SUBSCRIPTION_REQUEST,
	GET_USERS,
} from '@/graphql/operations/index';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

interface SubscriptionRequest {
	id: string;
	memberId: string;
	member: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	membershipId: string;
	membership: {
		id: string;
		name: string;
		monthlyPrice: number;
	};
	status: string;
	requestedAt: string;
	createdAt?: string | null;
	updatedAt?: string | null;
}

/** Monotonic age in seconds from `dateIso` to now (>= 0). */
function ageSeconds(dateIso: string | null | undefined): number {
	if (!dateIso) return 0;
	const t = new Date(dateIso).getTime();
	if (!Number.isFinite(t)) return 0;
	return Math.max(0, Math.floor((Date.now() - t) / 1000));
}

/** Human-readable "time since" for admin review. */
function formatRelativeSince(dateIso: string | null | undefined): string {
	const sec = ageSeconds(dateIso);
	if (sec < 60) return `${sec}s ago`;
	const min = Math.floor(sec / 60);
	if (min < 60) return `${min}m ago`;
	const hr = Math.floor(min / 60);
	if (hr < 48) return `${hr}h ago`;
	const day = Math.floor(hr / 24);
	if (day < 14) return `${day}d ago`;
	const wk = Math.floor(day / 7);
	return `${wk}w ago`;
}

/** Highlight requests waiting longer than this (seconds). */
const STALE_PENDING_SEC = 7 * 24 * 60 * 60;

export function SubscriptionRequestNotification() {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [approvingIds, setApprovingIds] = useState<string[]>([]);
	const dispatch = useAppDispatch();

	const { data, loading, error, refetch } = useQuery<{
		getPendingSubscriptionRequests: SubscriptionRequest[];
	}>(GET_PENDING_SUBSCRIPTION_REQUESTS, {
		pollInterval: 2000,
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		skip: false,
		onError: (err) => {
			console.error('Error fetching subscription requests:', err);
		},
	});

	const [approveRequest] = useMutation(APPROVE_SUBSCRIPTION_REQUEST, {
		refetchQueries: [
			{ query: GET_USERS, variables: { role: 'member' } },
			{ query: GET_USERS, variables: { role: 'coach' } },
		],
		onCompleted: (mutationData) => {
			const membershipName =
				mutationData.approveSubscriptionRequest.membership?.name || 'the selected plan';
			dispatch(
				addToast({
					type: 'success',
					message: `Successfully subscribed member to ${membershipName}`,
				})
			);
			refetch();
		},
		onError: (mutationError) => {
			console.error('Error approving subscription request:', mutationError);
			dispatch(
				addToast({
					type: 'error',
					message: mutationError.message || 'Failed to approve subscription request',
				})
			);
		},
	});

	const pendingRequests = useMemo(() => {
		const raw = (data?.getPendingSubscriptionRequests || []).filter(
			(request) => request && request.member && request.membership && request.membership.id
		);
		const rank = (r: SubscriptionRequest) => {
			const u = r.updatedAt ? new Date(r.updatedAt).getTime() : 0;
			const q = r.requestedAt ? new Date(r.requestedAt).getTime() : 0;
			return Math.max(u, q);
		};
		return [...raw].sort((a, b) => rank(b) - rank(a));
	}, [data?.getPendingSubscriptionRequests]);

	const handleApprove = async (requestId: string) => {
		if (approvingIds.includes(requestId)) return;
		setApprovingIds((prev) => [...prev, requestId]);
		try {
			await approveRequest({
				variables: {
					input: { requestId },
				},
			});
		} catch {
			// Error handled in onError
		} finally {
			setApprovingIds((prev) => prev.filter((id) => id !== requestId));
		}
	};

	useEffect(() => {
		if (pendingRequests.length > 0 && !isMinimized) {
			setIsExpanded(true);
		}
	}, [pendingRequests.length, isMinimized]);

	if (pendingRequests.length === 0 && !isExpanded) {
		return null;
	}

	return (
		<div className="fixed bottom-6 right-6 z-50">
			{!isExpanded && (
				<button
					type="button"
					onClick={() => {
						setIsExpanded(true);
						setIsMinimized(false);
					}}
					className="relative bg-gradient-to-br from-[var(--primary-red)] to-[var(--primary-yellow)] rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
				>
					<Bell className="w-6 h-6 text-white" />
					{pendingRequests.length > 0 && (
						<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
							{pendingRequests.length}
						</span>
					)}
				</button>
			)}

			{isExpanded && (
				<div className="bg-[var(--bg-darker)] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl w-96 max-h-[600px] flex flex-col">
					<div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.1)]">
						<div className="flex items-center gap-3">
							<Bell className="w-5 h-5 text-[var(--primary-yellow)]" />
							<h3 className="text-lg font-semibold text-[var(--text-primary)]">
								Subscription Requests
							</h3>
							{pendingRequests.length > 0 && (
								<span className="bg-[var(--primary-red)] text-white text-xs font-bold rounded-full px-2 py-1">
									{pendingRequests.length}
								</span>
							)}
						</div>
						<button
							type="button"
							onClick={() => {
								setIsExpanded(false);
								setIsMinimized(true);
							}}
							className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
						>
							{isMinimized ? (
								<ChevronUp className="w-5 h-5" />
							) : (
								<ChevronDown className="w-5 h-5" />
							)}
						</button>
					</div>

					{!isMinimized && (
						<div className="overflow-y-auto flex-1 p-4">
							{error && (
								<div className="text-center py-4 text-red-400 text-sm">
									Error loading requests: {error.message}
								</div>
							)}
							{loading ? (
								<div className="text-center py-8 text-[var(--text-secondary)]">
									Loading requests...
								</div>
							) : pendingRequests.length === 0 ? (
								<div className="text-center py-8 text-[var(--text-secondary)]">
									<Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
									<p>No pending subscription requests</p>
								</div>
							) : (
								<div className="space-y-3">
									{pendingRequests.map((request) => {
										if (
											!request ||
											!request.member ||
											!request.membership ||
											!request.membership.id
										) {
											return null;
										}

										const ageSec = ageSeconds(request.requestedAt);
										const isStale = ageSec >= STALE_PENDING_SEC;

										return (
											<div
												key={request.id}
												className={`bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 ${
													isStale ? 'border-amber-500/40 bg-amber-500/5' : ''
												}`}
											>
												<div className="flex items-start justify-between mb-3">
													<div className="flex-1">
														<h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
															{request.member?.firstName || 'Unknown'}{' '}
															{request.member?.lastName || ''}
														</h4>
														<p className="text-xs text-[var(--text-secondary)] mb-2">
															{request.member?.email || 'No email'}
														</p>
														<div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
															<span className="font-medium text-[var(--primary-yellow)]">
																{request.membership?.name || 'Unknown Plan'}
															</span>
															{request.membership?.monthlyPrice != null && (
																<>
																	<span>•</span>
																	<span>₱{request.membership.monthlyPrice.toLocaleString()}</span>
																</>
															)}
														</div>
													</div>
													<button
														type="button"
														onClick={() => {
															setIsExpanded(false);
															setIsMinimized(true);
														}}
														aria-label="Close subscription request card"
														title="Close"
														className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-2"
													>
														<X className="w-4 h-4" />
													</button>
												</div>

												<div
													className={`flex flex-col gap-1 mb-3 text-xs ${
														isStale ? 'text-amber-200/90' : 'text-[var(--text-secondary)]'
													}`}
												>
													<div className="flex items-center gap-2">
														<Clock className="w-3 h-3 shrink-0" />
														<span>Request sent {formatRelativeSince(request.requestedAt)}</span>
													</div>
													{isStale && (
														<p className="pl-5 text-[11px] opacity-90">
															Pending over a week — please review soon.
														</p>
													)}
												</div>

												<div className="flex gap-2">
													{(() => {
														const isApproving = approvingIds.includes(request.id);
														return (
													<button
														type="button"
														onClick={() => handleApprove(request.id)}
														disabled={isApproving}
														className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
															isApproving
																? 'bg-green-500/10 text-green-300 cursor-not-allowed opacity-70'
																: 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
														}`}
													>
														<Check className="w-4 h-4" />
														{isApproving ? 'Approving...' : 'Approve'}
													</button>
														);
													})()}
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
