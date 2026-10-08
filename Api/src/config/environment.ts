import { getJwtSecret } from '../lib/auth-token.js';

function requireEnvironmentVariable(name: string): string {
	const value = process.env[name]?.trim();
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export function validateRuntimeEnvironment(): void {
	requireEnvironmentVariable('DB_URI');
	getJwtSecret();

	if (process.env.NODE_ENV === 'production') {
		requireEnvironmentVariable('CLERK_SECRET_KEY');
	}

	const cloudinaryValues = [
		process.env.CLOUDINARY_CLOUD_NAME,
		process.env.CLOUDINARY_API_KEY,
		process.env.CLOUDINARY_API_SECRET,
	];
	const configuredCloudinaryValues = cloudinaryValues.filter(
		(value) => value?.trim(),
	).length;
	if (configuredCloudinaryValues > 0 && configuredCloudinaryValues < 3) {
		throw new Error(
			'Cloudinary configuration is incomplete. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET together.',
		);
	}
}
