import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Bell, CheckCheck } from 'lucide-react';
import {
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
	const notificationsEnabled = import.meta.env.VITE_ENABLE_SYSTEM_NOTIFICATIONS !== 'false';
	const [open, setOpen] = useState(false);
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

	const notifications = useMemo(
		() => data?.getMyNotifications || [],
		[data]
	);
	const unreadCount = useMemo(
		() => notifications.filter((n) => !n.isRead).length,
		[notifications]
	);

	if (!notificationsEnabled) return null;

	const onMarkRead = async (id: string) => {
		await markOne({ variables: { id } });
		void refetch();
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
						<h4 className="text-sm font-semibold text-[var(--text-primary)]">System Notifications</h4>
						<button
							type="button"
							onClick={() => void markAll()}
							className="text-xs text-[var(--primary-yellow)] flex items-center gap-1"
						>
							<CheckCheck className="w-3.5 h-3.5" /> Mark all read
						</button>
					</div>
					<div className="max-h-[400px] overflow-y-auto">
						{notifications.length === 0 ? (
							<p className="px-4 py-6 text-sm text-[var(--text-secondary)]">No notifications yet.</p>
						) : (
							notifications.map((n) => (
								<button
									key={n.id}
									type="button"
									onClick={() => !n.isRead && void onMarkRead(n.id)}
									className={`w-full text-left px-4 py-3 border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.03)] ${
										n.isRead ? 'opacity-70' : ''
									}`}
								>
									<div className="flex items-center justify-between gap-2">
										<p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
										{!n.isRead && <span className="w-2 h-2 rounded-full bg-[var(--primary-yellow)]" />}
									</div>
									<p className="text-xs text-[var(--text-secondary)] mt-1">{n.message}</p>
									{n.createdAt && (
										<p className="text-[10px] text-[var(--text-secondary)] mt-1">
											{new Date(n.createdAt).toLocaleString('en-PH')}
										</p>
									)}
								</button>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}
