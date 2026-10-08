import { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type ExportDownloadDropdownProps = {
	onExportPdf: () => void | Promise<void>;
	onExportCsv: () => void | Promise<void>;
	/** Trigger label (default matches module export affordance). */
	label?: string;
	align?: 'start' | 'center' | 'end';
	className?: string;
	disabled?: boolean;
	ariaLabel?: string;
};

export function ExportDownloadDropdown({
	onExportPdf,
	onExportCsv,
	label = 'Export',
	align = 'end',
	className,
	disabled = false,
	ariaLabel = 'Export: choose PDF or CSV',
}: ExportDownloadDropdownProps) {
	const [open, setOpen] = useState(false);

	const run = (fn: () => void | Promise<void>) => {
		setOpen(false);
		void fn();
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					className={cn(
						'flex shrink-0 items-center gap-2 px-4 py-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[var(--text-primary)] text-sm font-medium hover:border-[var(--primary-yellow)] hover:bg-[rgba(249,197,19,0.08)] transition-all focus:outline-none focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.15)] disabled:pointer-events-none disabled:opacity-45',
						className,
					)}
					aria-label={ariaLabel}
				>
					<Download className="w-4 h-4 text-[var(--primary-yellow)]" aria-hidden />
					{label}
					<ChevronDown
						className={cn(
							'w-4 h-4 text-[var(--text-secondary)] transition-transform',
							open && 'rotate-180',
						)}
						aria-hidden
					/>
				</button>
			</PopoverTrigger>
			<PopoverContent
				align={align}
				sideOffset={8}
				className="w-[min(100vw-2rem,20rem)] rounded-xl border border-[rgba(255,255,255,0.12)] p-2 text-[var(--text-primary)] shadow-2xl ring-1 ring-black/25 !bg-[#16181f]"
			>
				<div className="flex flex-col gap-0.5">
					<button
						type="button"
						onClick={() => run(onExportPdf)}
						className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
					>
						<Download className="h-4 w-4 shrink-0 text-[#fb923c]" aria-hidden />
						<span>Export as PDF</span>
					</button>
					<button
						type="button"
						onClick={() => run(onExportCsv)}
						className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
					>
						<Download className="h-4 w-4 shrink-0 text-[#4ade80]" aria-hidden />
						<span>Export as CSV</span>
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
