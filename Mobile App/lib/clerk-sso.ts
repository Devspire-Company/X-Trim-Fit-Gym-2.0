import { setActiveIgnoringSessionConflict } from '@/lib/clerk-session-errors';

type SetActive = (params: { session: string }) => Promise<void>;

export async function storeTokenAfterClerkSession(
	createdSessionId: string | null | undefined,
	setActive: SetActive | undefined,
	_getToken: () => Promise<string | null>,
): Promise<boolean> {
	if (!createdSessionId || !setActive) return false;
	await setActiveIgnoringSessionConflict(setActive, createdSessionId);
	return true;
}
