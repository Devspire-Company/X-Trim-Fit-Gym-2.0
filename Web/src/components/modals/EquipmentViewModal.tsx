import { X, CalendarDays, Info, FileText } from 'lucide-react';
import { EquipmentStatus } from '@/graphql/generated/graphql';

type EquipmentLike = {
	id: string;
	name: string;
	imageUrl: string;
	description?: string | null;
	notes?: string | null;
	status: EquipmentStatus;
	quantity?: number | null;
	createdAt?: string | null;
	acquiredAt?: string | null;
	maintenanceStartedAt?: string | null;
	isArchived?: boolean | null;
	archivedAt?: string | null;
	archiveReason?: string | null;
};

interface EquipmentViewModalProps {
	isOpen: boolean;
	onClose: () => void;
	equipment: EquipmentLike | null;
	maintenanceSince?: string;
}

function formatDate(dateValue: string | null | undefined): string {
	if (!dateValue) return 'N/A';
	const t = new Date(dateValue);
	if (!Number.isFinite(t.getTime())) return 'N/A';
	return t.toLocaleString('en-PH', {
		timeZone: 'Asia/Manila',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function statusText(status: EquipmentStatus): string {
	switch (status) {
		case EquipmentStatus.Damaged:
			return 'Damaged';
		case EquipmentStatus.Undermaintenance:
			return 'Under maintenance';
		default:
			return 'Available';
	}
}

function statusClass(status: EquipmentStatus): string {
	switch (status) {
		case EquipmentStatus.Damaged:
			return 'bg-[rgba(239,68,68,0.15)] text-[#EF4444] border-[rgba(239,68,68,0.3)]';
		case EquipmentStatus.Undermaintenance:
			return 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border-[rgba(245,158,11,0.3)]';
		default:
			return 'bg-[rgba(16,185,129,0.15)] text-[#10B981] border-[rgba(16,185,129,0.3)]';
	}
}

export function EquipmentViewModal({
	isOpen,
	onClose,
	equipment,
	maintenanceSince,
}: EquipmentViewModalProps) {
	if (!isOpen || !equipment) return null;

	return (
		<div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
			<div
				className="modal modal-large flex max-h-[90vh] flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header shrink-0">
					<h2 className="modal-title">Equipment Details</h2>
					<button className="modal-close" onClick={onClose} aria-label="Close">
						<X size={24} />
					</button>
				</div>

				<div className="modal-body min-h-0 flex-1 overflow-y-auto">
					<div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
						<div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--bg-darker)]">
							<img
								src={equipment.imageUrl}
								alt={equipment.name}
								className="h-full max-h-[26rem] w-full object-cover"
							/>
						</div>
						<div className="space-y-4">
							<div className="flex items-start justify-between gap-3">
								<h3 className="text-xl font-bold text-[var(--text-primary)]">{equipment.name}</h3>
								<span
									className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${statusClass(equipment.status)}`}
								>
									{statusText(equipment.status)}
								</span>
							</div>

							<div className="rounded-xl border border-[var(--card-border)] bg-[rgba(255,255,255,0.02)] p-3">
								<p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--text-secondary)]">
									<CalendarDays className="h-4 w-4" />
									Timeline
								</p>
								<div className="space-y-1.5 text-sm text-[var(--text-primary)]">
									<p>Quantity remaining: {Math.max(0, Number(equipment.quantity ?? 0))}</p>
									<p>Added: {formatDate(equipment.createdAt)}</p>
									<p>Acquired: {formatDate(equipment.acquiredAt)}</p>
									{equipment.status === EquipmentStatus.Undermaintenance ? (
										<p>
											Under maintenance since:{' '}
											{formatDate(maintenanceSince ?? equipment.maintenanceStartedAt)}
										</p>
									) : null}
									{equipment.isArchived ? (
										<>
											<p>Archived: {formatDate(equipment.archivedAt)}</p>
											<p>Archive reason: {equipment.archiveReason || 'N/A'}</p>
										</>
									) : null}
								</div>
							</div>

							<div className="rounded-xl border border-[var(--card-border)] bg-[rgba(255,255,255,0.02)] p-3">
								<p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--text-secondary)]">
									<Info className="h-4 w-4" />
									Description
								</p>
								<p className="text-sm leading-relaxed text-[var(--text-primary)]">
									{equipment.description || 'No description provided.'}
								</p>
							</div>

							<div className="rounded-xl border border-[var(--card-border)] bg-[rgba(255,255,255,0.02)] p-3">
								<p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--text-secondary)]">
									<FileText className="h-4 w-4" />
									Notes
								</p>
								<p className="text-sm leading-relaxed text-[var(--text-primary)]">
									{equipment.notes || 'No notes available.'}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
