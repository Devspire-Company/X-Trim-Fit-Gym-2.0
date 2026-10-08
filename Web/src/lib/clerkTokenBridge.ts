let getToken: (() => Promise<string | null>) | null = null;

export function registerClerkTokenGetter(fn: () => Promise<string | null>) {
	getToken = fn;
}

export async function getAuthBearerToken(): Promise<string> {
	if (getToken) {
		const t = await getToken();
		if (t) return t;
	}
	return '';
}
