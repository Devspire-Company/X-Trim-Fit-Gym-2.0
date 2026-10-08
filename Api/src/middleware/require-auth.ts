import type { RequestHandler } from 'express';
import { getAuthUserFromHttpRequest } from '../context/auth-context.js';

export const requireAuthenticatedUser: RequestHandler = async (req, res, next) => {
	try {
		const user = await getAuthUserFromHttpRequest(req);
		if (!user) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}
		res.locals.authUser = user;
		next();
	} catch (error) {
		console.error('Authentication check failed:', error);
		res.status(401).json({ error: 'Unauthorized' });
	}
};
