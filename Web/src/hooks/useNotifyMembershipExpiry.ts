import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import {
	isMembershipExpiredForNotification,
	memberDisplayName,
} from '@/lib/membershipExpiry';

/**
 * When member list data updates (poll/subscription), toast once per member when
 * their membership becomes expired (was not expired on the previous snapshot).
 * Skips the transition from "loading" to first payload so opening the page does not
 * flood toasts for members who were already expired.
 */
export function useNotifyMembershipExpiry(members: unknown[] | undefined, listLoading: boolean) {
	const dispatch = useAppDispatch();
	const prevSnapRef = useRef<unknown[] | null>(null);

	useEffect(() => {
		if (listLoading) return;

		const list = members ?? [];
		if (prevSnapRef.current === null) {
			prevSnapRef.current = list;
			return;
		}

		const prev = prevSnapRef.current;
		const prevExpired = new Map<string, boolean>();
		for (const raw of prev) {
			const m = raw as Record<string, unknown>;
			const id = m.id;
			if (typeof id === 'string') prevExpired.set(id, isMembershipExpiredForNotification(m));
		}

		for (const raw of list) {
			const m = raw as Record<string, unknown>;
			const id = m.id;
			if (typeof id !== 'string') continue;
			const nowExp = isMembershipExpiredForNotification(m);
			const wasExp = prevExpired.get(id) ?? false;
			if (nowExp && !wasExp) {
				dispatch(
					addToast({
						type: 'warning',
						message: `${memberDisplayName(m)}'s membership has expired.`,
					})
				);
			}
		}

		prevSnapRef.current = list;
	}, [members, listLoading, dispatch]);
}
