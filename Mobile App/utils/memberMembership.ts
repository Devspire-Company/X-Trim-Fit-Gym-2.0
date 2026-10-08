import type { User } from '@/graphql/generated/types';

/** MembershipTransaction is authoritative; membershipId alone is only a plan projection. */
export function memberHasActiveGymMembership(user: User | null | undefined): boolean {
	const membership = user?.currentMembership;
	if (!membership || membership.status !== 'ACTIVE') return false;
	const expiresAt = new Date(membership.expiresAt).getTime();
	return Number.isFinite(expiresAt) && expiresAt >= Date.now();
}
