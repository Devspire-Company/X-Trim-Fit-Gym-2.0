import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import {
	getJwtSecret,
	signLegacyAuthToken,
	verifyLegacyAuthToken,
} from '../src/lib/auth-token.js';

const TEST_SECRET = 'test-secret-that-is-at-least-thirty-two-characters-long';

test('legacy authentication tokens are signed with expiry and verified claims', () => {
	const previous = process.env.JWT_SECRET;
	process.env.JWT_SECRET = TEST_SECRET;
	try {
		const token = signLegacyAuthToken({ id: 'user-123', role: 'member' });
		const payload = jwt.decode(token);
		assert.equal(typeof payload, 'object');
		assert.ok(payload && typeof payload === 'object' && payload.exp);
		assert.deepEqual(verifyLegacyAuthToken(token), {
			id: 'user-123',
			role: 'member',
		});
	} finally {
		if (previous === undefined) delete process.env.JWT_SECRET;
		else process.env.JWT_SECRET = previous;
	}
});

test('JWT configuration rejects weak secrets', () => {
	const previousSecret = process.env.JWT_SECRET;
	const previousLegacySecret = process.env.JWT_SIKRIT;
	process.env.JWT_SECRET = 'too-short';
	delete process.env.JWT_SIKRIT;
	try {
		assert.throws(() => getJwtSecret(), /at least 32 characters/);
	} finally {
		if (previousSecret === undefined) delete process.env.JWT_SECRET;
		else process.env.JWT_SECRET = previousSecret;
		if (previousLegacySecret === undefined) delete process.env.JWT_SIKRIT;
		else process.env.JWT_SIKRIT = previousLegacySecret;
	}
});

test('tokens cannot be verified after the server secret changes', () => {
	const previous = process.env.JWT_SECRET;
	try {
		process.env.JWT_SECRET = TEST_SECRET;
		const token = signLegacyAuthToken({ id: 'coach-123', role: 'coach' });
		process.env.JWT_SECRET = 'different-secret-that-is-also-more-than-thirty-two-characters';
		assert.throws(() => verifyLegacyAuthToken(token));
	} finally {
		if (previous === undefined) delete process.env.JWT_SECRET;
		else process.env.JWT_SECRET = previous;
	}
});
