import { CheckCircle2 } from 'lucide-react';

interface SuccessModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	message: string;
}

export function SuccessModal({
	isOpen,
	onClose,
	title,
	message,
}: SuccessModalProps) {
	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal modal-center" onClick={(e) => e.stopPropagation()}>
				<div className="modal-body">
					<div className="modal-success-icon-large">
						<CheckCircle2 size={48} />
					</div>
					<h2 className="modal-success-title">{title}</h2>
					<p className="modal-success-text">{message}</p>
					<div className="modal-button-center">
						<button
							className="btn-primary modal-button-full"
							onClick={onClose}
						>
							OK
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

