import express from 'express';
import { requireAuthenticatedUser } from '../middleware/require-auth.js';

const router = express.Router();
const RAPID_API_HOST = 'exercisedb.p.rapidapi.com';
const RAPID_API_BASE = `https://${RAPID_API_HOST}`;

function apiKey(): string {
	const key = process.env.EXERCISEDB_API_KEY?.trim();
	if (!key) throw new Error('Exercise service is not configured');
	return key;
}

function boundedInteger(value: unknown, fallback: number, max: number): number {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < 0) return fallback;
	return Math.min(parsed, max);
}

async function rapidApiFetch(path: string): Promise<Response> {
	return fetch(`${RAPID_API_BASE}${path}`, {
		headers: {
			'X-RapidAPI-Key': apiKey(),
			'X-RapidAPI-Host': RAPID_API_HOST,
			Accept: 'application/json',
		},
		signal: AbortSignal.timeout(15_000),
	});
}

router.get('/', requireAuthenticatedUser, async (req, res) => {
	try {
		const limit = boundedInteger(req.query.limit, 60, 1200);
		const offset = boundedInteger(req.query.offset, 0, 10_000);
		const bodyPart = String(req.query.bodyPart || '').trim();
		const path = bodyPart && bodyPart.toLowerCase() !== 'all'
			? `/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=${limit}&offset=${offset}`
			: `/exercises?limit=${limit}&offset=${offset}`;
		const upstream = await rapidApiFetch(path);
		const body = await upstream.text();
		res.status(upstream.status).type('application/json').send(body);
	} catch (error) {
		console.error('Exercise lookup failed:', error);
		res.status(502).json({ error: 'Exercise service is temporarily unavailable' });
	}
});

router.get('/body-parts', requireAuthenticatedUser, async (_req, res) => {
	try {
		const upstream = await rapidApiFetch('/exercises/bodyPartList');
		const body = await upstream.text();
		res.status(upstream.status).type('application/json').send(body);
	} catch (error) {
		console.error('Exercise category lookup failed:', error);
		res.status(502).json({ error: 'Exercise service is temporarily unavailable' });
	}
});

// Images contain no member data. Keeping this endpoint public allows React Native
// image components to cache them without embedding the RapidAPI credential.
router.get('/image/:exerciseId', async (req, res) => {
	try {
		const exerciseId = String(req.params.exerciseId || '').trim();
		if (!/^[A-Za-z0-9_-]{1,80}$/.test(exerciseId)) {
			res.status(400).json({ error: 'Invalid exercise id' });
			return;
		}
		const resolution = boundedInteger(req.query.resolution, 360, 720) || 360;
		const upstream = await fetch(
			`${RAPID_API_BASE}/image?exerciseId=${encodeURIComponent(exerciseId)}&resolution=${resolution}`,
			{
				headers: {
					'X-RapidAPI-Key': apiKey(),
					'X-RapidAPI-Host': RAPID_API_HOST,
				},
				signal: AbortSignal.timeout(15_000),
			},
		);
		if (!upstream.ok || !upstream.body) {
			res.status(upstream.status || 502).end();
			return;
		}
		res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/webp');
		res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
		const bytes = Buffer.from(await upstream.arrayBuffer());
		res.status(200).send(bytes);
	} catch (error) {
		console.error('Exercise image proxy failed:', error);
		res.status(502).end();
	}
});

export default router;
