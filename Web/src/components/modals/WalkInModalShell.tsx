import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type WalkInModalShellProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	subtitle?: string;
	children: ReactNode;
};

export function WalkInModalShell({
	open,
	onClose,
	title,
	subtitle,
	children,
}: WalkInModalShellProps) {
	if (!open) return null;

	return (
		<div className={`modal-overlay ${open ? 'active' : ''}`} onClick={onClose}>
			<div
				className="modal modal-large w-[calc(100%-2rem)] max-w-[560px]"
				onClick={(e) => e.stopPropagation()}
				style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
			>
				<div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[var(--card-border)] shrink-0">
					<div>
						<h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
						{subtitle ? (
							<p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>
						) : null}
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)]"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</button>
				</div>
				<div className="p-6 overflow-y-auto flex-1 min-h-0">{children}</div>
			</div>
		</div>
	);
}
