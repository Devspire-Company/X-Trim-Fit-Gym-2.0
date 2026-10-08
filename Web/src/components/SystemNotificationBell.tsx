import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery } from '@apollo/client';
import { Bell, CheckCheck, LoaderCircle, Trash2, X } from 'lucide-react';
import {
	DELETE_ALL_MY_NOTIFICATIONS,
	DELETE_MY_NOTIFICATION,
	GET_MY_NOTIFICATIONS,
	MARK_ALL_MY_NOTIFICATIONS_READ,
	MARK_NOTIFICATION_READ,
} from '@/graphql/operations';

type NotificationRow = {
	id: string;
	type: 'INACTIVITY' | 'MEMBERSHIP_EXPIRING' | 'SESSION_SCHEDULED';
	title: string;
	message: string;
	isRead: boolean;
	createdAt?: string | null;
};

export function SystemNotificationBell() {
	const notificationsAvailable = import.meta.env.VITE_ENABLE_SYSTEM_NOTIFICATIONS !== 'false';
	const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
		notificationsAvailable
			? window.localStorage.getItem('xtrimfitgym.systemNotificationsEnabled') !== 'false'
			: false
	);
	const [open, setOpen] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [pendingDelete, setPendingDelete] = useState<{
		scope: 'one' | 'all';
		id?: string;
		title?: string;
	} | null>(null);

	useEffect(() => {
		const handlePreference = (event: Event) => {
			const customEvent = event as CustomEvent<{ enabled: boolean }>;
			setNotificationsEnabled(notificationsAvailable && customEvent.detail.enabled);
			if (!customEvent.detail.enabled) {
				setOpen(false);
				setPendingDelete(null);
			}
		};

		window.addEventListener('xtrimfitgym:notification-preference', handlePreference);
		return () =>
			window.removeEventListener('xtrimfitgym:notification-preference', handlePreference);
	}, [notificationsAvailable]);

	const { data, refetch } = useQuery<{ getMyNotifications: NotificationRow[] }>(
		GET_MY_NOTIFICATIONS,
		{
			variables: { limit: 20, unreadOnly: false },
			pollInterval: 30_000,
			fetchPolicy: 'network-only',
			skip: !notificationsEnabled,
		}
	);

	const [markOne] = useMutation(MARK_NOTIFICATION_READ);
	const [markAll] = useMutation(MARK_ALL_MY_NOTIFICATIONS_READ, {
		onCompleted: () => void refetch(),
	});
	const [deleteOne] = useMutation(DELETE_MY_NOTIFICATION);
	const [deleteAll, { loading: deletingAll }] = useMutation(DELETE_ALL_MY_NOTIFICATIONS);

	useEffect(() => {
		if (!pendingDelete) return;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && !deletingAll && deletingId === null) {
				setPendingDelete(null);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [pendingDelete, deletingAll, deletingId]);

	const notifications = useMemo(() => data?.getMyNotifications || [], [data]);
	const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

	if (!notificationsEnabled) return null;

	const onMarkRead = async (id: string) => {
		try {
			setActionError(null);
			await markOne({ variables: { id } });
			await refetch();
		} catch {
			setActionError('Could not update the notification. Please try again.');
		}
	};

	const onDeleteOne = async (id: string) => {
		try {
			setActionError(null);
			setDeletingId(id);
			await deleteOne({ variables: { id } });
			await refetch();
			setPendingDelete(null);
		} catch {
			setActionError('Could not delete the notification. Please try again.');
		} finally {
			setDeletingId(null);
		}
	};

	const onDeleteAll = async () => {
		if (notifications.length === 0) return;

		try {
			setActionError(null);
			await deleteAll();
			await refetch();
			setPendingDelete(null);
		} catch {
			setActionError('Could not clear the notifications. Please try again.');
		}
	};

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="relative rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] p-2.5 text-[var(--text-primary)]"
				aria-label="System notifications"
			>
				<Bell className="w-5 h-5" />
				{unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[var(--primary-red)] text-white text-[10px] font-bold flex items-center justify-center">
						{unreadCount}
					</span>
				)}
			</button>

			{open && (
				<div className="absolute right-0 mt-2 w-[360px] max-h-[460px] overflow-hidden rounded-xl bg-[var(--bg-darker)] border border-[rgba(255,255,255,0.1)] shadow-[0_10px_30px_rgba(0,0,0,0.45)] z-50">
					<div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
						<h4 className="text-sm font-semibold text-[var(--text-primary)]">
							System Notifications
						</h4>
						<div className="flex items-center gap-3">
							{unreadCount > 0 && (
								<button
									type="button"
									onClick={() => void markAll()}
									className="text-xs text-[var(--primary-yellow)] flex items-center gap-1"
								>
									<CheckCheck className="w-3.5 h-3.5" /> Mark all read
								</button>
							)}
							{notifications.length > 0 && (
								<button
									type="button"
									onClick={() => setPendingDelete({ scope: 'all' })}
									disabled={deletingAll}
									className="text-xs text-[var(--text-secondary)] hover:text-red-400 flex items-center gap-1 disabled:opacity-50"
								>
									{deletingAll ? (
										<LoaderCircle className="w-3.5 h-3.5 animate-spin" />
									) : (
										<Trash2 className="w-3.5 h-3.5" />
									)}
									Clear all
								</button>
							)}
						</div>
					</div>
					{actionError && (
						<p role="alert" className="px-4 py-2 text-xs text-red-400 bg-red-500/5">
							{actionError}
						</p>
					)}
					<div className="max-h-[400px] overflow-y-auto">
						{notifications.length === 0 ? (
							<p className="px-4 py-6 text-sm text-[var(--text-secondary)]">
								No notifications yet.
							</p>
						) : (
							notifications.map((n) => (
								<div
									key={n.id}
									className={`group relative w-full border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.03)] ${
										n.isRead ? 'opacity-70' : ''
									}`}
								>
									<button
										type="button"
										onClick={() => !n.isRead && void onMarkRead(n.id)}
										className="w-full text-left px-4 py-3 pr-12"
									>
										<div className="flex items-center justify-between gap-2">
											<p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
											{!n.isRead && (
												<span className="w-2 h-2 rounded-full bg-[var(--primary-yellow)]" />
											)}
										</div>
										<p className="text-xs text-[var(--text-secondary)] mt-1">{n.message}</p>
										{n.createdAt && (
											<p className="text-[10px] text-[var(--text-secondary)] mt-1">
												{new Date(n.createdAt).toLocaleString('en-PH')}
											</p>
										)}
									</button>
									<button
										type="button"
										onClick={() => setPendingDelete({ scope: 'one', id: n.id, title: n.title })}
										disabled={deletingId === n.id}
										className="absolute right-3 top-3 p-1.5 rounded-md text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition"
										aria-label={`Delete ${n.title} notification`}
									>
										{deletingId === n.id ? (
											<LoaderCircle className="w-3.5 h-3.5 animate-spin" />
										) : (
											<Trash2 className="w-3.5 h-3.5" />
										)}
									</button>
								</div>
							))
						)}
					</div>
				</div>
			)}

			{pendingDelete &&
				createPortal(
					<div className="modal-overlay active" onClick={() => setPendingDelete(null)}>
						<div
							className="modal modal-center notification-confirm-modal"
							onClick={(event) => event.stopPropagation()}
							role="dialog"
							aria-modal="true"
							aria-labelledby="notification-delete-title"
						>
							<div className="modal-body">
								<button
									type="button"
									className="modal-close-button"
									onClick={() => setPendingDelete(null)}
									aria-label="Close confirmation"
								>
									<X className="w-4 h-4" />
								</button>
								<div className="notification-delete-icon">
									<Trash2 className="w-6 h-6" />
								</div>
								<h3 id="notification-delete-title" className="modal-logout-title">
									{pendingDelete.scope === 'all'
										? 'Clear all notifications?'
										: 'Delete this notification?'}
								</h3>
								<p className="modal-logout-text">
									{pendingDelete.scope === 'all'
										? `This will permanently remove all ${notifications.length} notifications from your account.`
										: `"${pendingDelete.title}" will be permanently removed from your account.`}
								</p>
								<div className="modal-logout-actions">
									<button
										type="button"
										className="btn-secondary"
										onClick={() => setPendingDelete(null)}
										disabled={deletingAll || deletingId !== null}
									>
										Cancel
									</button>
									<button
										type="button"
										className="btn-danger"
										disabled={deletingAll || deletingId !== null}
										onClick={() => {
											if (pendingDelete.scope === 'all') void onDeleteAll();
											else if (pendingDelete.id) void onDeleteOne(pendingDelete.id);
										}}
									>
										{deletingAll || deletingId !== null ? (
											<LoaderCircle className="w-4 h-4 animate-spin" />
										) : (
											<Trash2 className="w-4 h-4" />
										)}
										{pendingDelete.scope === 'all' ? 'Clear all' : 'Delete'}
									</button>
								</div>
							</div>
						</div>
					</div>,
					document.body
				)}
		</div>
	);
}
