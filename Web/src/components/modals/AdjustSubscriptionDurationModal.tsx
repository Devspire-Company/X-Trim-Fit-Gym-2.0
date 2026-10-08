import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { X, Calendar, Loader2 } from 'lucide-react';
import { UPDATE_MEMBERSHIP_TRANSACTION_DURATION, GET_USERS } from '@/graphql/operations/index';
import { RoleType } from '@/graphql/generated/graphql';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

function isoOrDateToDateInput(iso: string | undefined): string {
	if (!iso) return '';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

interface AdjustSubscriptionDurationModalProps {
	isOpen: boolean;
	onClose: () => void;
	transactionId: string;
	memberName: string;
	/** When true, edit length in calendar days; otherwise in months. */
	usesDays: boolean;
	currentMonthDuration: number;
	/** Current day length when `usesDays` (from transaction or plan). */
	currentDayDuration: number;
	/** Current subscription start (ISO); used to prefill the optional override field. */
	currentStartedAtIso?: string;
	onSuccess?: () => void;
}

export function AdjustSubscriptionDurationModal({
	isOpen,
	onClose,
	transactionId,
	memberName,
	usesDays,
	currentMonthDuration,
	currentDayDuration,
	currentStartedAtIso,
	onSuccess,
}: AdjustSubscriptionDurationModalProps) {
	const [months, setMonths] = useState(String(currentMonthDuration));
	const [days, setDays] = useState(String(currentDayDuration));
	/** YYYY-MM-DD; empty = keep existing startedAt on save */
	const [subscriptionStartDate, setSubscriptionStartDate] = useState('');
	const [adjustmentReason, setAdjustmentReason] = useState('');
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (isOpen) {
			setMonths(String(currentMonthDuration));
			setDays(String(currentDayDuration));
			setSubscriptionStartDate(isoOrDateToDateInput(currentStartedAtIso));
			setAdjustmentReason('');
		}
	}, [isOpen, currentMonthDuration, currentDayDuration, currentStartedAtIso]);

	const [updateDuration, { loading }] = useMutation(UPDATE_MEMBERSHIP_TRANSACTION_DURATION, {
		refetchQueries: [{ query: GET_USERS, variables: { role: RoleType.Member } }],
		onCompleted: (data) => {
			const exp = data.updateMembershipTransactionDuration.expiresAt;
			const expStr = exp
				? new Date(exp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
				: '';
			const d = data.updateMembershipTransactionDuration.dayDuration;
			const m = data.updateMembershipTransactionDuration.monthDuration;
			const lenStr =
				d != null && d >= 1 ? `${d} day${d === 1 ? '' : 's'}` : `${m} month${m === 1 ? '' : 's'}`;
			dispatch(
				addToast({
					type: 'success',
					message: `Updated ${memberName}'s subscription (${lenStr}${expStr ? `, expires ${expStr}` : ''})`,
				})
			);
			onSuccess?.();
			onClose();
		},
		onError: (error) => {
			dispatch(
				addToast({
					type: 'error',
					message: error.message || 'Failed to update subscription duration',
				})
			);
		},
	});

	const buildInput = (): { transactionId: string; monthDuration?: number; dayDuration?: number; startedAt?: string; reason: string } => {
		const base: { transactionId: string; monthDuration?: number; dayDuration?: number; startedAt?: string; reason: string } = {
			transactionId,
			reason: adjustmentReason.trim(),
		};
		if (subscriptionStartDate.trim()) {
			const d = new Date(`${subscriptionStartDate.trim()}T12:00:00`);
			if (!Number.isNaN(d.getTime())) {
				base.startedAt = d.toISOString();
			}
		}
		return base;
	};

	const handleSubmit = () => {
		if (!adjustmentReason.trim()) {
			dispatch(
				addToast({
					type: 'error',
					message: 'Reason is required for audit trail',
				})
			);
			return;
		}
		const input = buildInput();

		if (usesDays) {
			const n = parseInt(days, 10);
			if (!Number.isFinite(n) || n < 1) {
				dispatch(
					addToast({
						type: 'error',
						message: 'Enter a valid number of days (at least 1)',
					})
				);
				return;
			}
			updateDuration({
				variables: {
					input: {
						...input,
						dayDuration: n,
					},
				},
			}).catch(() => {});
			return;
		}

		const n = parseInt(months, 10);
		if (!Number.isFinite(n) || n < 1) {
			dispatch(
				addToast({
					type: 'error',
					message: 'Enter a valid number of months (at least 1)',
				})
			);
			return;
		}
		updateDuration({
			variables: {
				input: {
					...input,
					monthDuration: n,
				},
			},
		}).catch(() => {});
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay active" onClick={onClose}>
			<div className="modal modal-center" onClick={(e) => e.stopPropagation()}>
				<div className="modal-body">
					<div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
						<div
							className="modal-success-icon-large"
							style={{
								background: 'linear-gradient(135deg, var(--primary-red), var(--primary-yellow))',
							}}
						>
							<Calendar size={48} style={{ color: 'white' }} />
						</div>
					</div>

					<h2 className="modal-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
						Edit subscription length
					</h2>

					<p className="modal-text" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
						Set total {usesDays ? 'calendar days' : 'months'} from the subscription start date for{' '}
						<strong>{memberName}</strong>. You can optionally override the start date (for walk-ins or legacy
						records); expiry is recalculated from that start and the length below.
					</p>

					<label className="block text-sm text-[var(--text-secondary)] mb-2" htmlFor="sub-start-override">
						Subscription start date (optional)
					</label>
					<input
						id="sub-start-override"
						type="date"
						value={subscriptionStartDate}
						onChange={(e) => setSubscriptionStartDate(e.target.value)}
						className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] text-[var(--text-primary)] mb-4"
					/>
					<p className="text-xs text-[var(--text-secondary)] mb-4 -mt-2">
						Leave as shown to keep the current start; change it to align walk-in or backdated subscriptions with
						manual subscribe behavior.
					</p>
					<label className="block text-sm text-[var(--text-secondary)] mb-2" htmlFor="sub-adjust-reason">
						Reason <span className="text-red-400">*</span>
					</label>
					<input
						id="sub-adjust-reason"
						type="text"
						value={adjustmentReason}
						onChange={(e) => setAdjustmentReason(e.target.value)}
						placeholder="Why is this subscription being adjusted?"
						className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] text-[var(--text-primary)] mb-4"
					/>

					{usesDays ? (
						<>
							<label className="block text-sm text-[var(--text-secondary)] mb-2" htmlFor="sub-days">
								Total duration (days)
							</label>
							<input
								id="sub-days"
								type="number"
								min={1}
								value={days}
								onChange={(e) => setDays(e.target.value)}
								className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] text-[var(--text-primary)] mb-6"
							/>
						</>
					) : (
						<>
							<label className="block text-sm text-[var(--text-secondary)] mb-2" htmlFor="sub-months">
								Total duration (months)
							</label>
							<input
								id="sub-months"
								type="number"
								min={1}
								value={months}
								onChange={(e) => setMonths(e.target.value)}
								className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] text-[var(--text-primary)] mb-6"
							/>
						</>
					)}

					<div className="modal-actions" style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
						<button
							type="button"
							className="btn-secondary"
							onClick={onClose}
							disabled={loading}
							style={{ flex: 1, padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600 }}
						>
							<X className="w-4 h-4 inline mr-1" />
							Cancel
						</button>
						<button
							type="button"
							className="btn-primary"
							onClick={handleSubmit}
							disabled={loading}
							style={{ flex: 1, padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600 }}
						>
							{loading ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin inline mr-1" />
									Saving…
								</>
							) : (
								'Save'
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
