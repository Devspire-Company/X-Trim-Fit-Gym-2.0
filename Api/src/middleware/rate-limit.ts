import type { Request, RequestHandler } from 'express';

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientKey(req: Request): string {
	return req.ip || req.socket.remoteAddress || 'unknown';
}

function consume(key: string, limit: number, windowMs: number): number | null {
	const now = Date.now();
	const current = buckets.get(key);
	if (!current || current.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return null;
	}

	current.count += 1;
	if (current.count <= limit) return null;
	return Math.max(1, Math.ceil((current.resetAt - now) / 1000));
}

export const graphqlRateLimit: RequestHandler = (req, res, next) => {
	if (req.method === 'OPTIONS') return next();
	const identity = clientKey(req);
	const generalRetry = consume(`graphql:${identity}`, 300, 60_000);
	if (generalRetry) {
		res.setHeader('Retry-After', String(generalRetry));
		res.status(429).json({ errors: [{ message: 'Too many requests. Please try again shortly.' }] });
		return;
	}

	const operationName = String(req.body?.operationName || '');
	const query = String(req.body?.query || '');
	const isSensitiveAuthOperation =
		/^(Login|CreateUser|RequestDevEmailVerificationCode|RequestDevCoachSignInCode|DevCoachSignIn)$/i.test(
			operationName,
		) ||
		/\b(login|createUser|requestDevEmailVerificationCode|requestDevCoachSignInCode|devCoachSignIn)\s*\(/.test(
			query,
		);

	if (isSensitiveAuthOperation) {
		const authRetry = consume(`auth:${identity}`, 10, 15 * 60_000);
		if (authRetry) {
			res.setHeader('Retry-After', String(authRetry));
			res.status(429).json({ errors: [{ message: 'Too many authentication attempts. Try again later.' }] });
			return;
		}
	}

	next();
};

const cleanupTimer = setInterval(() => {
	const now = Date.now();
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) buckets.delete(key);
	}
}, 15 * 60_000);
cleanupTimer.unref();
