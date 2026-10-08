import { X, Edit2, Check } from 'lucide-react';
import type { Membership } from '@/graphql/generated/types';

interface MembershipViewModalProps {
	isOpen: boolean;
	onClose: () => void;
	membership: Membership | null;
	onEdit?: () => void;
}

export function MembershipViewModal({
	isOpen,
	onClose,
	membership,
	onEdit,
}: MembershipViewModalProps) {
	if (!isOpen || !membership) return null;

	// Map API status values to display format
	const statusMap: Record<string, string> = {
		ACTIVE: 'Active',
		INACTIVE: 'Inactive',
		COMING_SOON: 'Coming Soon',
	};

	// Map API durationType values to display format
	const durationMap: Record<string, string> = {
		MONTHLY: 'Monthly',
		QUARTERLY: 'Quarterly',
		YEARLY: 'Yearly',
		DAILY: 'Daily (fixed days)',
	};

	const displayStatus = statusMap[membership.status] || membership.status;
	const displayDuration = durationMap[membership.durationType] || membership.durationType;
	const statusEffectiveLabel = (() => {
		const iso = (membership as Membership & { statusEffectiveAt?: string | null }).statusEffectiveAt;
		if (!iso) return 'Effective immediately';
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return 'Effective immediately';
		return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	})();

	return (
		<div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
			<div
				className="modal modal-large"
				onClick={(e) => e.stopPropagation()}
				style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
			>
				<div className="modal-header" style={{ flexShrink: 0 }}>
					<h2 className="modal-title">Membership Plan Details</h2>
					<button className="modal-close" onClick={onClose} aria-label="Close">
						<X size={24} />
					</button>
				</div>

				<div className="modal-body" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
					<div className="membership-details">
						<div className="detail-section">
							<h3>Plan Information</h3>
							<div className="detail-grid">
								<div className="detail-item">
									<label>Plan Name</label>
									<p>{membership.name}</p>
								</div>
								<div className="detail-item">
									<label>Price</label>
									<p className="price-value font-['Inter',ui-sans-serif,system-ui,sans-serif]">
										<span style={{ marginRight: '0.2rem' }}>₱</span>
										{membership.monthlyPrice.toLocaleString()}
									</p>
								</div>
								<div className="detail-item">
									<label>Duration</label>
									<p>{displayDuration}</p>
								</div>
								<div className="detail-item">
									<label>{membership.durationType === 'DAILY' ? 'Length (days)' : 'Length (months)'}</label>
									<p>
										{membership.monthDuration}{' '}
										{membership.durationType === 'DAILY'
											? `day${membership.monthDuration === 1 ? '' : 's'}`
											: `month${membership.monthDuration === 1 ? '' : 's'}`}
									</p>
								</div>
								<div className="detail-item">
									<label>Status</label>
									<span
										className={`px-2.5 py-1.5 text-xs rounded-lg font-semibold ${
											membership.status === 'ACTIVE'
												? 'bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)]'
												: membership.status === 'INACTIVE'
												? 'bg-[rgba(107,114,128,0.15)] text-[#9CA3AF] border border-[rgba(107,114,128,0.3)]'
												: 'bg-[rgba(249,197,19,0.15)] text-[var(--primary-yellow)] border border-[rgba(249,197,19,0.3)]'
										}`}
									>
										{displayStatus}
									</span>
								</div>
								<div className="detail-item">
									<label>Status Effective Date</label>
									<p>{statusEffectiveLabel}</p>
								</div>
								<div className="detail-item" style={{ gridColumn: '1 / -1' }}>
									<label>Description</label>
									<p>{membership.description || 'No description provided'}</p>
								</div>
							</div>
						</div>

						<div className="detail-section">
							<h3>Features</h3>
							<ul className="features-list">
								{membership.features && membership.features.length > 0 ? (
									membership.features.map((feature, index) => (
										<li key={index}>
											<Check size={18} style={{ color: 'var(--primary-yellow)' }} />
											<span>{feature}</span>
										</li>
									))
								) : (
									<li style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
										No features listed
									</li>
								)}
							</ul>
						</div>
					</div>
				</div>

				<div className="modal-footer" style={{ flexShrink: 0 }}>
					<button className="btn-secondary" onClick={onClose}>
						Close
					</button>
					{onEdit && (
						<button className="btn-primary" onClick={onEdit}>
							<Edit2 size={18} />
							Edit Plan
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

