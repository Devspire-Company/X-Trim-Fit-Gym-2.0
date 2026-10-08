import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { removeToast } from '@/store/slices/uiSlice';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
	success: CheckCircle2,
	error: XCircle,
	warning: AlertTriangle,
	info: Info,
};

export function ToastContainer() {
	const toasts = useAppSelector((state) => state.ui.toasts);
	const dispatch = useAppDispatch();

	return (
		<div className="fixed top-4 right-4 flex flex-col gap-2 max-w-md w-full" style={{ zIndex: 9999 }}>
			{toasts.map((toast) => {
				const Icon = icons[toast.type];
				return (
					<Toast
						key={toast.id}
						toast={toast}
						Icon={Icon}
						onClose={() => dispatch(removeToast(toast.id))}
					/>
				);
			})}
		</div>
	);
}

function Toast({
	toast,
	Icon,
	onClose,
}: {
	toast: { id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' };
	Icon: typeof CheckCircle2;
	onClose: () => void;
}) {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, 5000);

		return () => clearTimeout(timer);
	}, [onClose]);

	return (
		<div
			className={cn(
				'flex items-center gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-md animate-in slide-in-from-right',
				{
					'bg-[rgba(16,185,129,0.15)] border-[rgba(16,185,129,0.3)]': toast.type === 'success',
					'bg-[rgba(239,68,68,0.15)] border-[rgba(239,68,68,0.3)]': toast.type === 'error',
					'bg-[rgba(249,197,19,0.15)] border-[rgba(249,197,19,0.3)]': toast.type === 'warning',
					'bg-[rgba(59,130,246,0.15)] border-[rgba(59,130,246,0.3)]': toast.type === 'info',
				}
			)}
		>
			<Icon
				className={cn('w-5 h-5 shrink-0', {
					'text-[#10B981]': toast.type === 'success',
					'text-[#EF4444]': toast.type === 'error',
					'text-[var(--primary-yellow)]': toast.type === 'warning',
					'text-[#3B82F6]': toast.type === 'info',
				})}
			/>
			<p className="flex-1 text-sm font-medium text-[var(--text-primary)]">{toast.message}</p>
			<button
				onClick={onClose}
				className="shrink-0 p-1 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
			>
				<X className="w-4 h-4" />
			</button>
		</div>
	);
}

