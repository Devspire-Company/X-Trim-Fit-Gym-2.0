export type RemovedMembershipLog = {
	id: string;
	planId: string;
	planName: string;
	planPrice: number;
	planDurationType: string;
	reason: string;
	removedAt: string;
	removedBy: string;
};

export const REMOVED_MEMBERSHIP_LOGS_KEY = 'xtrimfit-removed-membership-plans';

export function readRemovedMembershipLogs(): RemovedMembershipLog[] {
	try {
		const raw = localStorage.getItem(REMOVED_MEMBERSHIP_LOGS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as RemovedMembershipLog[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function appendRemovedMembershipLog(log: Omit<RemovedMembershipLog, 'id'>): RemovedMembershipLog[] {
	const next: RemovedMembershipLog = {
		id: `removed-membership-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		...log,
	};
	const current = readRemovedMembershipLogs();
	const updated = [next, ...current].slice(0, 200);
	localStorage.setItem(REMOVED_MEMBERSHIP_LOGS_KEY, JSON.stringify(updated));
	return updated;
}
