import jwt from 'jsonwebtoken';
import type { RoleType } from '../database/models/user/user-schema.js';

const TOKEN_ISSUER = 'xtrimfitgym-api';
const TOKEN_AUDIENCE = 'xtrimfitgym-clients';

export type LegacyAuthTokenPayload = {
	id: string;
	role: RoleType;
};

export function getJwtSecret(): string {
	const secret = process.env.JWT_SECRET || process.env.JWT_SIKRIT;
	if (!secret || secret.trim().length < 32) {
		throw new Error(
			'JWT_SECRET must be configured with at least 32 characters (JWT_SIKRIT is supported temporarily for migration).',
		);
	}
	return secret;
}

export function signLegacyAuthToken(payload: LegacyAuthTokenPayload): string {
	return jwt.sign(payload, getJwtSecret(), {
		expiresIn: '7d',
		issuer: TOKEN_ISSUER,
		audience: TOKEN_AUDIENCE,
	});
}

export function verifyLegacyAuthToken(token: string): LegacyAuthTokenPayload {
	const decoded = jwt.verify(token, getJwtSecret(), {
		issuer: TOKEN_ISSUER,
		audience: TOKEN_AUDIENCE,
	});

	if (
		typeof decoded !== 'object' ||
		decoded === null ||
		typeof decoded.id !== 'string' ||
		!['admin', 'coach', 'member'].includes(String(decoded.role))
	) {
		throw new Error('Invalid authentication token payload');
	}

	return {
		id: decoded.id,
		role: decoded.role as RoleType,
	};
}
