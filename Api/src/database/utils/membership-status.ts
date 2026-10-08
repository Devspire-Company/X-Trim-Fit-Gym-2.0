import mongoose from 'mongoose';
import MembershipTransaction from '../models/membership/membershipTransaction-schema.js';
import User from '../models/user/user-schema.js';

/**
 * MembershipTransaction is authoritative. The User membership id is maintained
 * only as a compatibility projection for older clients.
 */
export async function synchronizeMembershipForUser(
	userId: string | mongoose.Types.ObjectId,
) {
	const clientId =
		typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
	const now = new Date();

	await MembershipTransaction.updateMany(
		{
			client_id: clientId,
			status: 'Active',
			expiresAt: { $lt: now },
		},
		{ $set: { status: 'Expired' } },
	);

	const active = await MembershipTransaction.findOne({
		client_id: clientId,
		status: 'Active',
		expiresAt: { $gte: now },
	})
		.sort({ createdAt: -1 })
		.lean();

	if (active) {
		await User.updateOne(
			{ _id: clientId },
			{ $set: { 'membershipDetails.membership_id': active.membership_id } },
		);
	} else {
		await User.updateOne(
			{ _id: clientId },
			{ $unset: { 'membershipDetails.membership_id': '' } },
		);
	}

	return active;
}

export async function expireDueMemberships(): Promise<number> {
	const due = await MembershipTransaction.find({
		status: 'Active',
		expiresAt: { $lt: new Date() },
	})
		.select('_id client_id')
		.lean();

	if (due.length === 0) return 0;

	await MembershipTransaction.updateMany(
		{ _id: { $in: due.map((transaction) => transaction._id) }, status: 'Active' },
		{ $set: { status: 'Expired' } },
	);

	const affectedUsers = [
		...new Set(due.map((transaction) => String(transaction.client_id))),
	];
	await Promise.all(
		affectedUsers.map((userId) => synchronizeMembershipForUser(userId)),
	);

	return due.length;
}
