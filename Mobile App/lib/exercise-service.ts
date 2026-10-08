import { API_URL } from '@/lib/apollo-client';
import { getClerkBearerToken } from '@/lib/clerk-token';

const API_BASE_URL = API_URL.replace(/\/graphql\/?$/, '');
const EXERCISE_BASE_URL = `${API_BASE_URL}/api/exercises`;

async function authorizationHeaders(): Promise<Record<string, string>> {
	const clerkToken = await getClerkBearerToken();
	return clerkToken ? { Authorization: `Bearer ${clerkToken}` } : {};
}

async function getJson<T>(url: string): Promise<T> {
	const response = await fetch(url, {
		headers: await authorizationHeaders(),
	});
	if (!response.ok) {
		const payload = await response.json().catch(() => null) as { error?: string } | null;
		throw new Error(payload?.error || `Exercise service request failed (${response.status})`);
	}
	return response.json() as Promise<T>;
}

export function buildExerciseImageUrl(
	exerciseId: string,
	resolution: number | string = 360,
): string | null {
	const id = String(exerciseId || '').trim();
	if (!id) return null;
	return `${EXERCISE_BASE_URL}/image/${encodeURIComponent(id)}?resolution=${encodeURIComponent(String(resolution))}`;
}

export function fetchExercises<T>(
	bodyPart: string,
	limit = 60,
	offset = 0,
): Promise<T> {
	const params = new URLSearchParams({
		bodyPart,
		limit: String(limit),
		offset: String(offset),
	});
	return getJson<T>(`${EXERCISE_BASE_URL}?${params.toString()}`);
}

export function fetchExerciseBodyParts(): Promise<string[]> {
	return getJson<string[]>(`${EXERCISE_BASE_URL}/body-parts`);
}
