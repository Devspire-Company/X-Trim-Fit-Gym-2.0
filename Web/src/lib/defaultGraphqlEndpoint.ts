/**
 * Default endpoint behavior:
 * - Local development: prefer the local API so web + api-clean work out of the box.
 * - Non-development builds: fall back to hosted Render API when env vars are unset.
 */
const IS_DEV = import.meta.env.DEV;

export const DEFAULT_GRAPHQL_HTTP_URL = IS_DEV
	? 'http://localhost:8000/graphql'
	: 'https://xtrimfitgym-api.onrender.com/graphql';

export const DEFAULT_GRAPHQL_WS_URL = IS_DEV
	? 'ws://localhost:8000/graphql'
	: 'wss://xtrimfitgym-api.onrender.com/graphql';
