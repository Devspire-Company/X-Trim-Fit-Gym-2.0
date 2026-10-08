import { TransactionStatus } from '@/graphql/generated/graphql';

/** Same source order as Member Management rows. */
export function getMemberMembershipTransaction(user: Record<string, unknown> | null | undefined) {
	if (!user) return null;
	const current = user.currentMembership as Record<string, unknown> | null | undefined;
	const nested = (user.membershipDetails as Record<string, unknown> | undefined)?.membershipTransaction as
		| Record<string, unknown>
		| null
		| undefined;
	return (current || nested || null) as {
		status?: string;
		expiresAt?: string;
	} | null;
}

export function isMembershipExpiredForNotification(user: Record<string, unknown>): boolean {
	const tx = getMemberMembershipTransaction(user);
	if (!tx?.status) return false;
	if (tx.status === TransactionStatus.Canceled) return false;
	if (tx.status === TransactionStatus.Expired) return true;
	if (tx.status !== TransactionStatus.Active) return false;
	const exp = tx.expiresAt;
	if (!exp) return false;
	const end = new Date(exp).getTime();
	return Number.isFinite(end) && end < Date.now();
}

export function memberDisplayName(user: Record<string, unknown>): string {
	const first = String(user.firstName ?? '').trim();
	const last = String(user.lastName ?? '').trim();
	const name = [first, last].filter(Boolean).join(' ').trim();
	if (name) return name;
	const email = String(user.email ?? '').trim();
	return email || 'Member';
}
