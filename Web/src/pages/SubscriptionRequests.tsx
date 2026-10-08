import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { UiSelect } from '@/components/ui/UiSelect';
import { ExportDownloadDropdown } from '@/components/ExportDownloadDropdown';
import { X as XIcon, Clock, CheckCircle2, XCircle, Search } from 'lucide-react';
import { GET_ALL_SUBSCRIPTION_REQUESTS } from '@/graphql/operations/index';
import type { GetAllSubscriptionRequestsQuery } from '@/graphql/generated/types';
import { exportTableCsv } from '@/lib/csvExport';
import { exportTablePdf } from '@/lib/pdfExport';
import { useAppSelector } from '@/store/hooks';

const LIVE_UPDATE_INTERVAL_MS = 1500;

function userFullName(
	u: { firstName?: string | null; lastName?: string | null } | null | undefined
) {
	if (!u) return '';
	return `${u.firstName || ''} ${u.lastName || ''}`.trim();
}

export function SubscriptionRequestsPage() {
	useEffect(() => {
		document.title = 'Subscription Requests - X-TRIM FIT GYM';
	}, []);

	type SubscriptionRequestItem =
		GetAllSubscriptionRequestsQuery['getAllSubscriptionRequests'][number];
	const currentUser = useAppSelector((state) => state.auth.user);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');

	// Fetch all subscription requests
	const { data, loading, error, refetch } = useQuery(GET_ALL_SUBSCRIPTION_REQUESTS, {
		errorPolicy: 'none',
		fetchPolicy: 'cache-and-network',
		pollInterval: LIVE_UPDATE_INTERVAL_MS,
	});

	// Process data - must be before conditional returns to follow Rules of Hooks
	const requests = useMemo<SubscriptionRequestItem[]>(
		() => data?.getAllSubscriptionRequests || [],
		[data]
	);
	const normalizeText = (value: string | null | undefined) =>
		(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
	const activeRequests = useMemo(
		() =>
			requests.filter((request) => {
				const member = request.member;
				if (!member) return false;
				const searchableIdentity = normalizeText(
					`${member.firstName || ''} ${member.lastName || ''} ${member.email || ''}`
				);
				return searchableIdentity.length > 0;
			}),
		[requests]
	);

	// Filter requests based on search term and status
	const filteredRequests = useMemo(() => {
		const normalizedSearch = normalizeText(searchTerm);
		const normalizedStatus = normalizeText(statusFilter);
		const filtered = activeRequests.filter((request) => {
			// Search filter - search in member name, email, and plan name
			const memberName = normalizeText(
				`${request.member?.firstName || ''} ${request.member?.lastName || ''}`
			);
			const memberEmail = normalizeText(request.member?.email);
			const planName = normalizeText(request.membership?.name);
			const matchesSearch =
				!normalizedSearch ||
				memberName.includes(normalizedSearch) ||
				memberEmail.includes(normalizedSearch) ||
				planName.includes(normalizedSearch);

			// Status filter
			const requestStatus = normalizeText(request.status);
			const matchesStatus = normalizedStatus === 'all' || requestStatus === normalizedStatus;

			return matchesSearch && matchesStatus;
		});

		const ts = (r: SubscriptionRequestItem) => {
			const u = r.updatedAt ? new Date(r.updatedAt).getTime() : 0;
			const q = r.requestedAt ? new Date(r.requestedAt).getTime() : 0;
			return Math.max(u, q);
		};

		return [...filtered].sort((a, b) => ts(b) - ts(a));
	}, [activeRequests, searchTerm, statusFilter]);

	// Group filtered requests by status for statistics
	const pendingRequests = filteredRequests.filter((r) => r.status === 'PENDING');
	const approvedRequests = filteredRequests.filter((r) => r.status === 'APPROVED');

	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const subscriptionExportHead = [
		'Member',
		'Email',
		'Plan',
		'Price',
		'Status',
		'Requested At',
		'Processed By',
	];
	const subscriptionExportRows = filteredRequests.map((request) => [
		`${request.member?.firstName || ''} ${request.member?.lastName || ''}`.trim() || 'N/A',
		request.member?.email || 'N/A',
		request.membership?.name || 'N/A',
		request.membership?.monthlyPrice != null
			? `PHP ${Number(request.membership.monthlyPrice).toLocaleString()}`
			: 'N/A',
		request.status,
		formatDate(request.requestedAt),
		request.status === 'APPROVED'
			? userFullName(request.approvedBy) || 'Not recorded'
			: request.status === 'REJECTED'
				? userFullName(request.rejectedBy) || 'Not recorded'
				: '—',
	]);

	const handleExportPdf = () => {
		exportTablePdf({
			title: 'Subscription Requests',
			filePrefix: 'subscription-requests',
			reportType: 'SUBSCRIPTION_REQUESTS',
			user: currentUser,
			filterSummary: `status=${statusFilter};rows=${filteredRequests.length}`,
			subtitle: `Total rows: ${filteredRequests.length} | Filter: ${statusFilter}`,
			head: subscriptionExportHead,
			rows: subscriptionExportRows,
		});
	};

	const handleExportCsv = () => {
		exportTableCsv({
			filePrefix: 'subscription-requests',
			head: subscriptionExportHead,
			rows: subscriptionExportRows,
			reportType: 'SUBSCRIPTION_REQUESTS',
			user: currentUser,
			filterSummary: `status=${statusFilter};rows=${filteredRequests.length};format=csv`,
		});
	};

	// Show loading state
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-yellow)] mx-auto mb-4"></div>
					<p className="text-[var(--text-secondary)]">Loading subscription requests...</p>
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
						Unable to Load Subscription Requests
					</h2>
					<p className="text-[var(--text-secondary)] mb-4">
						{error?.message || 'Failed to connect to the server'}
					</p>
					<button onClick={() => refetch()} className="btn-primary">
						Retry
					</button>
				</div>
			</div>
		);
	}

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { label: string; className: string; icon: any }> = {
			PENDING: {
				label: 'Pending',
				className:
					'bg-[rgba(249,197,19,0.15)] text-[var(--primary-yellow)] border-[rgba(249,197,19,0.3)]',
				icon: Clock,
			},
			APPROVED: {
				label: 'Approved',
				className: 'bg-[rgba(16,185,129,0.15)] text-[#10B981] border-[rgba(16,185,129,0.3)]',
				icon: CheckCircle2,
			},
			REJECTED: {
				label: 'Rejected',
				className: 'bg-[rgba(239,68,68,0.15)] text-[#EF4444] border-[rgba(239,68,68,0.3)]',
				icon: XCircle,
			},
		};

		const statusInfo = statusMap[status] || statusMap.PENDING;
		const Icon = statusInfo.icon;

		return (
			<span
				className={`inline-flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg font-semibold border ${statusInfo.className}`}
			>
				<Icon className="w-3 h-3" />
				{statusInfo.label}
			</span>
		);
	};

	const formatRelativeSince = (dateString: string | null | undefined) => {
		if (!dateString) return '';
		const t = new Date(dateString).getTime();
		if (!Number.isFinite(t)) return '';
		const diffSec = Math.floor((Date.now() - t) / 1000);
		if (diffSec < 0) return 'just now';
		if (diffSec < 60) return `${diffSec}s ago`;
		const diffMin = Math.floor(diffSec / 60);
		if (diffMin < 60) return `${diffMin}m ago`;
		const diffHr = Math.floor(diffMin / 60);
		if (diffHr < 48) return `${diffHr}h ago`;
		const diffDay = Math.floor(diffHr / 24);
		if (diffDay < 14) return `${diffDay}d ago`;
		const diffWk = Math.floor(diffDay / 7);
		return `${diffWk}w ago`;
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h1 className="admin-page-title">
						<Clock className="w-8 h-8" color="var(--primary-yellow)" />
						Subscription Requests
					</h1>
					<p className="admin-page-subtitle">
						Manage all subscription requests from members ({filteredRequests.length} of{' '}
						{activeRequests.length} shown)
					</p>
				</div>
				<ExportDownloadDropdown onExportPdf={handleExportPdf} onExportCsv={handleExportCsv} />
			</div>

			{/* Search and Filter Bar */}
			<div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4">
				<div className="search-filter-bar flex flex-col md:flex-row gap-4">
					{/* Search Input */}
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
						<input
							type="text"
							placeholder="Search by member name, email, or plan name..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-darker)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-yellow)] focus:border-transparent"
						/>
					</div>

					{/* Status Filter */}
					<div className="md:w-48">
						<UiSelect
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							aria-label="Filter subscription requests by status"
							className="w-full px-4 py-2.5 bg-[var(--bg-darker)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-yellow)] focus:border-transparent"
						>
							<option value="all">All Status</option>
							<option value="PENDING">Pending</option>
							<option value="APPROVED">Approved</option>
						</UiSelect>
					</div>

					{/* Clear Filters Button */}
					{(searchTerm || statusFilter !== 'all') && (
						<Button
							onClick={() => {
								setSearchTerm('');
								setStatusFilter('all');
							}}
							className="btn-secondary"
						>
							<XIcon className="w-4 h-4" />
							Clear
						</Button>
					)}
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-[var(--text-secondary)] mb-1">Pending Requests</p>
							<p className="text-2xl font-bold text-[var(--text-primary)]">
								{pendingRequests.length}
							</p>
						</div>
						<Clock className="w-8 h-8 text-[var(--primary-yellow)]" />
					</div>
				</div>
				<div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-[var(--text-secondary)] mb-1">Approved</p>
							<p className="text-2xl font-bold text-[var(--text-primary)]">
								{approvedRequests.length}
							</p>
						</div>
						<CheckCircle2 className="w-8 h-8 text-[#10B981]" />
					</div>
				</div>
			</div>

			{/* Requests Table */}
			<div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.08)]">
							<tr>
								<th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
									Member
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
									Plan
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
									Requested / age
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
									Processed By
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
							{filteredRequests.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-6 py-12 text-center">
										<p className="text-[var(--text-secondary)]">
											{activeRequests.length === 0
												? 'No subscription requests found'
												: 'No subscription requests match your search criteria'}
										</p>
									</td>
								</tr>
							) : (
								filteredRequests.map((request) => {
									const sentAgo = formatRelativeSince(request.requestedAt);
									return (
										<tr key={request.id} className="hover:bg-[rgba(255,255,255,0.02)]">
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<p className="text-sm font-medium text-[var(--text-primary)]">
														{request.member?.firstName} {request.member?.lastName}
													</p>
													<p className="text-xs text-[var(--text-secondary)]">
														{request.member?.email}
													</p>
												</div>
											</td>
											<td className="px-6 py-4">
												<div>
													<p className="text-sm font-medium text-[var(--text-primary)]">
														{request.membership?.name}
													</p>
													<p className="text-xs text-[var(--text-secondary)]">
														₱{request.membership?.monthlyPrice?.toLocaleString()} /{' '}
														{request.membership?.monthDuration || 1} month
														{request.membership?.monthDuration !== 1 ? 's' : ''}
													</p>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<p className="text-sm text-[var(--text-primary)]">
													{formatDate(request.requestedAt)}
												</p>
												{sentAgo ? (
													<p className="text-xs text-[var(--text-secondary)] mt-0.5">
														Sent {sentAgo}
													</p>
												) : null}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{getStatusBadge(request.status)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{request.status === 'APPROVED' ? (
													<div>
														<p className="text-sm text-[var(--text-primary)]">
															{userFullName(request.approvedBy) || 'Not recorded'}
														</p>
														{request.approvedAt ? (
															<p className="text-xs text-[var(--text-secondary)]">
																{formatDate(request.approvedAt)}
															</p>
														) : null}
													</div>
												) : request.status === 'REJECTED' ? (
													<div>
														<p className="text-sm text-[var(--text-primary)]">
															{userFullName(request.rejectedBy) || 'Not recorded'}
														</p>
														{request.rejectedAt ? (
															<p className="text-xs text-[var(--text-secondary)]">
																{formatDate(request.rejectedAt)}
															</p>
														) : null}
													</div>
												) : (
													<p className="text-sm text-[var(--text-secondary)]">—</p>
												)}
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
