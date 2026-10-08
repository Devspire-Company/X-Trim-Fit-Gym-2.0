import { Check, Calendar, CreditCard } from 'lucide-react';
import type { Membership } from '@/graphql/generated/types';
import { DurationType } from '@/graphql/generated/graphql';

interface SubscribeModalProps {
	isOpen: boolean;
	onClose: () => void;
	membership: Membership | null;
	onConfirm: () => void;
	isLoading?: boolean;
}

export function SubscribeModal({
	isOpen,
	onClose,
	membership,
	onConfirm,
	isLoading = false,
}: SubscribeModalProps) {
	if (!isOpen || !membership) return null;

	const calculateEndDate = () => {
		const today = new Date();
		if (membership.durationType === DurationType.Daily) {
			const days = membership.monthDuration >= 1 ? membership.monthDuration : 1;
			const endDate = new Date(today);
			endDate.setDate(endDate.getDate() + days);
			return endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
		}
		let months = membership.monthDuration >= 1 ? membership.monthDuration : 1;
		if (membership.durationType === DurationType.Quarterly) months = 3;
		else if (membership.durationType === DurationType.Yearly) months = 12;

		const endDate = new Date(today);
		endDate.setMonth(endDate.getMonth() + months);
		return endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal modal-center" onClick={(e) => e.stopPropagation()}>
				<div className="modal-body">
					<div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
						<div
							className="modal-success-icon-large"
							style={{
								background: 'linear-gradient(135deg, var(--primary-red), var(--primary-yellow))',
							}}
						>
							<CreditCard size={48} style={{ color: 'white' }} />
						</div>
					</div>

					<h2 className="modal-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
						Subscribe to {membership.name}
					</h2>

					<p
						className="modal-text"
						style={{ textAlign: 'center', marginBottom: '2rem' }}
					>
						Confirm your subscription to this membership plan
					</p>

					<div className="subscription-summary">
						<div className="summary-item">
							<span>Plan</span>
							<strong>{membership.name}</strong>
						</div>
						<div className="summary-item">
							<span>Duration</span>
							<strong>{membership.durationType}</strong>
						</div>
						<div className="summary-item">
							<span>Price</span>
							<strong style={{ color: 'var(--primary-yellow)', fontSize: '1.25rem' }}>
								₱{membership.monthlyPrice.toLocaleString()}
							</strong>
						</div>
						<div className="summary-item">
							<span>
								<Calendar size={16} /> Valid Until
							</span>
							<strong>{calculateEndDate()}</strong>
						</div>
					</div>

					<div className="features-preview">
						<h4 style={{ marginBottom: '1rem' }}>Included Features:</h4>
						<ul className="features-list">
							{membership.features?.slice(0, 4).map((feature, index) => (
								<li key={index}>
									<Check size={16} style={{ color: 'var(--primary-yellow)' }} />
									<span>{feature}</span>
								</li>
							))}
							{membership.features && membership.features.length > 4 && (
								<li style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
									+{membership.features.length - 4} more features
								</li>
							)}
						</ul>
					</div>

					<div className="modal-actions" style={{ marginTop: '2rem' }}>
						<button
							className="btn-secondary"
							onClick={onClose}
							disabled={isLoading}
							style={{ flex: 1 }}
						>
							Cancel
						</button>
						<button
							className="btn-primary"
							onClick={onConfirm}
							disabled={isLoading}
							style={{ flex: 1 }}
						>
							{isLoading ? 'Processing...' : 'Confirm Subscription'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

