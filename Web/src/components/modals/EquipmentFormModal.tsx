import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { EquipmentStatus, type Equipment } from '@/graphql/generated/graphql';
import { DatePicker } from '@/components/ui/date-picker';

export interface EquipmentFormData {
	name: string;
	description: string;
	notes: string;
	acquiredAt: string;
	quantity: number;
	maintenanceStartedAt?: string;
	imageUrl: string;
	imageFile?: File | null;
	status: EquipmentStatus;
}

interface EquipmentFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: EquipmentFormData) => void;
	equipment?: Equipment | null;
	isLoading?: boolean;
	uploading?: boolean;
}

export function EquipmentFormModal({
	isOpen,
	onClose,
	onSubmit,
	equipment,
	isLoading = false,
	uploading = false,
}: EquipmentFormModalProps) {
	const [acquiredDate, setAcquiredDate] = useState<Date | undefined>(undefined);
	const [maintenanceStartDate, setMaintenanceStartDate] = useState<Date | undefined>(undefined);
	const [quantityInput, setQuantityInput] = useState('0');
	const [stockAdjustMode, setStockAdjustMode] = useState<'IN' | 'OUT'>('IN');
	const [stockAdjustAmount, setStockAdjustAmount] = useState('1');

	useEffect(() => {
		if (!isOpen) return;
		if (!equipment?.acquiredAt) {
			setAcquiredDate(undefined);
			return;
		}
		const parsed = new Date(equipment.acquiredAt);
		setAcquiredDate(Number.isFinite(parsed.getTime()) ? parsed : undefined);
	}, [isOpen, equipment?.acquiredAt]);

	useEffect(() => {
		if (!isOpen) return;
		if (!equipment?.maintenanceStartedAt) {
			setMaintenanceStartDate(undefined);
			return;
		}
		const parsed = new Date(equipment.maintenanceStartedAt);
		setMaintenanceStartDate(Number.isFinite(parsed.getTime()) ? parsed : undefined);
	}, [isOpen, equipment?.maintenanceStartedAt]);

	useEffect(() => {
		if (!isOpen) return;
		setQuantityInput(String(Math.max(0, Number(equipment?.quantity ?? 0))));
		setStockAdjustMode('IN');
		setStockAdjustAmount('0');
	}, [isOpen, equipment?.quantity]);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const name = (formData.get('name') as string)?.trim() || '';
		const description = (formData.get('description') as string)?.trim() || '';
		const notes = (formData.get('notes') as string)?.trim() || '';
		const acquiredAt = acquiredDate
			? `${acquiredDate.getFullYear()}-${String(acquiredDate.getMonth() + 1).padStart(2, '0')}-${String(acquiredDate.getDate()).padStart(2, '0')}`
			: '';
		const maintenanceStartedAt = maintenanceStartDate
			? `${maintenanceStartDate.getFullYear()}-${String(maintenanceStartDate.getMonth() + 1).padStart(2, '0')}-${String(maintenanceStartDate.getDate()).padStart(2, '0')}`
			: '';
		const imageUrl = (formData.get('imageUrl') as string)?.trim() || '';
		const imageFile = formData.get('imageFile') as File | null;
		const statusRaw = (formData.get('status') as string) || EquipmentStatus.Available;
		const quantityRaw = quantityInput.trim();
		const quantity = Number.parseInt(quantityRaw, 10);
		const quickAdjust = Number.parseInt(stockAdjustAmount.trim(), 10);
		const finalQuantity =
			equipment && Number.isFinite(quickAdjust) && quickAdjust > 0
				? Math.max(0, quantity + (stockAdjustMode === 'IN' ? quickAdjust : -quickAdjust))
				: quantity;
		if (!name) return;
		if (!Number.isFinite(finalQuantity) || finalQuantity < 0) return;
		onSubmit({
			name,
			description,
			notes,
			acquiredAt,
			quantity: finalQuantity,
			maintenanceStartedAt,
			imageUrl,
			imageFile: imageFile && imageFile.size > 0 ? imageFile : null,
			status: statusRaw as EquipmentStatus,
		});
	};

	if (!isOpen) return null;

	const defaultStatus = equipment?.status ?? EquipmentStatus.Available;
	const parsedQuickAdjust = Number.parseInt(stockAdjustAmount.trim(), 10);
	const currentQuantity = Math.max(0, Number.parseInt(quantityInput || '0', 10) || 0);
	const previewQuantity = Number.isFinite(parsedQuickAdjust) && parsedQuickAdjust > 0
		? Math.max(0, currentQuantity + (stockAdjustMode === 'IN' ? parsedQuickAdjust : -parsedQuickAdjust))
		: currentQuantity;

	return (
		<div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
			<div
				className="modal modal-large"
				onClick={(e) => e.stopPropagation()}
				style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
			>
				<div className="modal-header" style={{ flexShrink: 0 }}>
					<h2 className="modal-title">
						{equipment ? 'Edit Equipment' : 'Add Equipment'}
					</h2>
					<button type="button" className="modal-close" onClick={onClose} aria-label="Close">
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
								<label htmlFor="name">Name *</label>
								<input
									id="name"
									name="name"
									type="text"
									required
									defaultValue={equipment?.name ?? ''}
									placeholder="e.g. Treadmill"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="status">Status *</label>
								<select
									id="status"
									name="status"
									required
									defaultValue={defaultStatus}
									className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[var(--bg-darker)] px-3 py-2 text-[var(--text-primary)]"
								>
									<option value={EquipmentStatus.Available}>Available</option>
									<option value={EquipmentStatus.Damaged}>Damaged</option>
									<option value={EquipmentStatus.Undermaintenance}>Under maintenance</option>
								</select>
							</div>
							<div className="form-group">
								<label htmlFor="quantity">Quantity *</label>
								<input
									id="quantity"
									name="quantity"
									type="number"
									min={0}
									step={1}
									required
									value={quantityInput}
									onChange={(e) => setQuantityInput(e.target.value)}
									aria-label="Equipment quantity"
								/>
							</div>
							{equipment ? (
								<div
									className="form-group rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] p-3"
									style={{ gridColumn: '1 / -1' }}
								>
									<div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
										Stock adjustment
									</div>
									<div className="mb-3 inline-flex w-full items-center rounded-lg border border-[var(--card-border)] bg-[var(--bg-darker)] p-1">
										<button
											type="button"
											onClick={() => setStockAdjustMode('OUT')}
											className={`h-9 flex-1 rounded-md text-sm font-semibold transition ${
												stockAdjustMode === 'OUT'
													? 'bg-[rgba(239,68,68,0.16)] text-[#F87171]'
													: 'text-[var(--text-secondary)]'
											}`}
										>
											Stock out
										</button>
										<button
											type="button"
											onClick={() => setStockAdjustMode('IN')}
											className={`h-9 flex-1 rounded-md text-sm font-semibold transition ${
												stockAdjustMode === 'IN'
													? 'bg-[rgba(16,185,129,0.16)] text-[#34D399]'
													: 'text-[var(--text-secondary)]'
											}`}
										>
											Stock in
										</button>
									</div>
									<div className="flex flex-wrap items-end gap-2">
										<div className="min-w-[120px] flex-1">
											<label htmlFor="quick-stock-amount" className="mb-1 block text-xs text-[var(--text-secondary)]">
												Amount
											</label>
											<input
												id="quick-stock-amount"
												type="number"
												min={0}
												step={1}
												value={stockAdjustAmount}
												onChange={(e) => setStockAdjustAmount(e.target.value)}
												aria-label="Stock adjustment amount"
											/>
										</div>
									</div>
									<div className="mt-2 text-xs text-[var(--text-secondary)]">
										Preview quantity after save:{' '}
										<span className="font-semibold text-[var(--text-primary)]">{previewQuantity}</span>
									</div>
								</div>
							) : null}
							<div className="form-group">
								<label htmlFor="acquiredAt">Acquired date</label>
								<DatePicker
									date={acquiredDate}
									onDateChange={setAcquiredDate}
									placeholder="Select acquired date"
									className="w-full"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="maintenanceStartedAt">Maintenance started at</label>
								<DatePicker
									date={maintenanceStartDate}
									onDateChange={setMaintenanceStartDate}
									placeholder="Select maintenance start date"
									className="w-full"
								/>
							</div>
							<div className="form-group">
								<label>Added date</label>
								<input
									type="text"
									value={
										equipment?.createdAt
											? new Date(equipment.createdAt).toLocaleString('en-PH', {
													timeZone: 'Asia/Manila',
												})
											: 'Will be set automatically on create'
									}
									readOnly
								/>
							</div>
							<div className="form-group" style={{ gridColumn: '1 / -1' }}>
								<label htmlFor="description">Description</label>
								<textarea
									id="description"
									name="description"
									rows={2}
									defaultValue={equipment?.description ?? ''}
									placeholder="Optional description"
								/>
							</div>
							<div className="form-group" style={{ gridColumn: '1 / -1' }}>
								<label htmlFor="notes">Notes (optional)</label>
								<textarea
									id="notes"
									name="notes"
									rows={3}
									defaultValue={equipment?.notes ?? ''}
									placeholder="e.g. Back in service next week, maintenance scheduled…"
								/>
								<small className="text-[var(--text-secondary)] mt-1 block text-xs">
									Internal messages for members (availability, maintenance timeline, etc.)
								</small>
							</div>
							<div className="form-group" style={{ gridColumn: '1 / -1' }}>
								<label htmlFor="imageFile">Image *</label>
								{equipment?.imageUrl && (
									<div className="mb-3">
										<img
											src={equipment.imageUrl}
											alt={equipment.name}
											className="rounded-lg border border-[var(--card-border)] max-h-40 object-cover"
										/>
										<p className="text-sm text-[var(--text-secondary)] mt-1">
											Current image. Upload a new file to replace.
										</p>
									</div>
								)}
								<input
									type="hidden"
									name="imageUrl"
									defaultValue={equipment?.imageUrl ?? ''}
								/>
								<input
									id="imageFile"
									name="imageFile"
									type="file"
									accept="image/*"
									className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--primary-yellow)] file:text-black file:font-semibold"
								/>
							</div>
						</div>
					</div>
					<div className="modal-footer" style={{ flexShrink: 0 }}>
						<button
							type="submit"
							className="btn-primary"
							disabled={isLoading || uploading}
						>
							{uploading ? 'Uploading image...' : isLoading ? 'Saving...' : equipment ? 'Update' : 'Create'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
