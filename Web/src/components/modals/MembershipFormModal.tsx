import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Membership } from '@/graphql/generated/types';

interface MembershipFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: MembershipFormData) => void;
	membership?: Membership | null;
	isLoading?: boolean;
}

export interface MembershipFormData {
	name: string;
	monthlyPrice: number;
	description: string;
	features: string[];
	status: 'Active' | 'Inactive' | 'Coming Soon';
	statusEffectiveAt: string;
	durationType: 'Monthly' | 'Quarterly' | 'Yearly' | 'Daily' | 'Minutes';
	monthDuration: number;
}

export function MembershipFormModal({
	isOpen,
	onClose,
	onSubmit,
	membership,
	isLoading = false,
}: MembershipFormModalProps) {
	const [priceInput, setPriceInput] = useState('');
	const [planLengthInput, setPlanLengthInput] = useState('1');
	const [featureInputs, setFeatureInputs] = useState<string[]>(['']);
	const [featuresError, setFeaturesError] = useState('');
	const [statusEffectiveAtInput, setStatusEffectiveAtInput] = useState('');

	useEffect(() => {
		if (!isOpen) return;
		setPriceInput(
			membership?.monthlyPrice != null ? String(Math.round(Number(membership.monthlyPrice))) : ''
		);
		setPlanLengthInput(String(membership?.monthDuration || 1));
		const effectiveDateIso = membership?.statusEffectiveAt || '';
		const effectiveDateValue = effectiveDateIso
			? new Date(effectiveDateIso).toISOString().slice(0, 10)
			: new Date().toISOString().slice(0, 10);
		setStatusEffectiveAtInput(effectiveDateValue);
		const initialFeatures =
			membership?.features && membership.features.length > 0 ? membership.features : [''];
		setFeatureInputs(initialFeatures);
		setFeaturesError('');
	}, [isOpen, membership]);

	const parseNumericInput = (raw: string, fallback = 0) => {
		const digits = raw.replace(/[^\d]/g, '');
		if (!digits) return fallback;
		const parsed = Number.parseInt(digits, 10);
		return Number.isFinite(parsed) ? parsed : fallback;
	};

	const handleFeatureChange = (idx: number, value: string) => {
		setFeatureInputs((prev) => prev.map((item, i) => (i === idx ? value : item)));
		if (featuresError) setFeaturesError('');
	};

	const addFeatureInput = () => {
		setFeatureInputs((prev) => [...prev, '']);
	};

	const removeFeatureInput = (idx: number) => {
		setFeatureInputs((prev) => {
			if (prev.length <= 1) return [''];
			return prev.filter((_, i) => i !== idx);
		});
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		const features = featureInputs
			.map((f) => f.trim())
			.filter((f) => f.length > 0);
		if (features.length === 0) {
			setFeaturesError('Please add at least one feature.');
			return;
		}

		const data: MembershipFormData = {
			name: formData.get('name') as string,
			monthlyPrice: parseNumericInput(priceInput, 0),
			description: formData.get('description') as string,
			features,
			status: formData.get('status') as MembershipFormData['status'],
			statusEffectiveAt: statusEffectiveAtInput,
			durationType: formData.get('durationType') as MembershipFormData['durationType'],
			monthDuration: Math.max(1, parseNumericInput(planLengthInput, 1)),
		};

		onSubmit(data);
	};

	// Map API durationType values to form values
	const durationMap: Record<string, string> = {
		MONTHLY: 'Monthly',
		QUARTERLY: 'Quarterly',
		YEARLY: 'Yearly',
		DAILY: 'Daily',
		MINUTES: 'Minutes',
	};

	const defaultStatus =
		membership?.status === 'COMING_SOON'
			? 'Coming Soon'
			: membership?.status === 'INACTIVE'
				? 'Inactive'
			: membership?.status === 'ACTIVE'
				? 'Active'
				: 'Active';
	const defaultDurationType = membership?.durationType
		? durationMap[membership.durationType] || 'Monthly'
		: 'Monthly';

	if (!isOpen) return null;

	return (
		<div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
			<div
				className="modal modal-large"
				onClick={(e) => e.stopPropagation()}
				style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
			>
				<div className="modal-header" style={{ flexShrink: 0 }}>
					<h2 className="modal-title">
						{membership ? 'Edit Membership Plan' : 'Create Membership Plan'}
					</h2>
					<button className="modal-close" onClick={onClose} aria-label="Close">
						<X size={24} />
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
				>
					<div className="modal-body" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="name">Plan Name *</label>
								<input
									type="text"
									id="name"
									name="name"
									defaultValue={membership?.name}
									required
									placeholder="e.g., Student, Premium"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="monthlyPrice">Price *</label>
								<input
									type="text"
									id="monthlyPrice"
									name="monthlyPrice"
									inputMode="numeric"
									pattern="[0-9]*"
									value={priceInput}
									onChange={(e) => setPriceInput(e.target.value.replace(/[^\d]/g, ''))}
									required
									placeholder="e.g., 500"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="durationType">Duration Type *</label>
								<select
									id="durationType"
									name="durationType"
									defaultValue={defaultDurationType}
									required
								>
									<option value="Monthly">Monthly</option>
									<option value="Quarterly">Quarterly</option>
									<option value="Yearly">Yearly</option>
									<option value="Daily">Daily (fixed days / promos)</option>
									<option value="Minutes">Minutes</option>
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="monthDuration" id="monthDurationLabel">
									Plan length *
								</label>
								<input
									type="text"
									id="monthDuration"
									name="monthDuration"
									inputMode="numeric"
									pattern="[0-9]*"
									value={planLengthInput}
									onChange={(e) => setPlanLengthInput(e.target.value.replace(/[^\d]/g, ''))}
									required
									placeholder="e.g., 3 months, 15 days, or 5 minutes"
								/>
								<small
									id="monthDurationHint"
									style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}
								>
									For Monthly / Quarterly / Yearly: length in months. For Daily: calendar days. For Minutes: exact minutes (e.g., 5 or 10).
								</small>
							</div>

							<div className="form-group">
								<label htmlFor="status">Status *</label>
								<select id="status" name="status" defaultValue={defaultStatus} required>
									<option value="Active">Active</option>
									<option value="Inactive">Inactive</option>
									<option value="Coming Soon">Coming Soon</option>
								</select>
							</div>
							<div className="form-group">
								<label htmlFor="statusEffectiveAt">Status effective date *</label>
								<input
									type="date"
									id="statusEffectiveAt"
									name="statusEffectiveAt"
									value={statusEffectiveAtInput}
									onChange={(e) => setStatusEffectiveAtInput(e.target.value)}
									required
								/>
								<small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
									When this status starts applying for new avails.
								</small>
							</div>

							<div className="form-group" style={{ gridColumn: '1 / -1' }}>
								<label htmlFor="description">Description *</label>
								<textarea
									id="description"
									name="description"
									defaultValue={membership?.description ?? ''}
									required
									rows={3}
									placeholder="Brief description of the membership plan"
								/>
							</div>

							<div className="form-group" style={{ gridColumn: '1 / -1' }}>
								<label>Features *</label>
								<div className="space-y-3">
									{featureInputs.map((feature, idx) => (
										<div
											key={`feature-${idx}`}
											className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl border border-[var(--card-border)] bg-[rgba(255,255,255,0.03)] p-2.5"
										>
											<input
												type="text"
												value={feature}
												onChange={(e) => handleFeatureChange(idx, e.target.value)}
												placeholder={`Feature ${idx + 1}`}
												className="border-0 bg-transparent px-2 py-2"
											/>
											<button
												type="button"
												onClick={() => removeFeatureInput(idx)}
												disabled={featureInputs.length === 1}
												className="rounded-xl border border-[var(--card-border)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] disabled:opacity-40"
											>
												Remove
											</button>
										</div>
									))}
									<button
										type="button"
										onClick={addFeatureInput}
										className="w-full rounded-2xl border border-dashed border-[rgba(249,197,19,0.45)] bg-[rgba(249,197,19,0.08)] px-3 py-2.5 text-sm font-semibold text-[var(--primary-yellow)]"
									>
										+ Add feature
									</button>
								</div>
								{featuresError ? (
									<small style={{ color: '#f87171', marginTop: '0.5rem', display: 'block' }}>
										{featuresError}
									</small>
								) : (
									<small
										style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}
									>
										Add one feature per field for cleaner plan details.
									</small>
								)}
							</div>
						</div>
					</div>

					<div className="modal-footer" style={{ flexShrink: 0 }}>
						<button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
							Cancel
						</button>
						<button type="submit" className="btn-primary" disabled={isLoading}>
							{isLoading ? 'Saving...' : membership ? 'Update Plan' : 'Create Plan'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
