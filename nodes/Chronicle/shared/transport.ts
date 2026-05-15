import type {
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

const CREDENTIAL_NAME = 'chronicleApi';

// Resolve baseUrl from credentials (set in ChronicleApi.credentials.ts) and
// build the absolute URL for httpRequestWithAuthentication. Required because
// n8n's `requestDefaults.baseURL` from the node description only applies to
// declarative routing — not to direct calls from listSearch / customOperations.
export async function chronicleApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	path: string,
	body?: unknown,
): Promise<unknown> {
	const credentials = await this.getCredentials(CREDENTIAL_NAME);
	const baseUrl = (credentials.baseUrl as string) || 'https://api.chroniclehq.com';

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl.replace(/\/$/, '')}${path}`,
		json: true,
	};
	if (body !== undefined) options.body = body;

	return this.helpers.httpRequestWithAuthentication.call(this, CREDENTIAL_NAME, options);
}

// Chronicle's /api/v1 errors follow the shape:
//   { error: { code: string; message: string; status: number } }
// n8n's NodeApiError canned messages for 4xx/5xx hide that body. This helper
// digs out the specific message from common locations n8n's HTTP helpers stash
// the response body so customOperations can surface "INTERNAL_ERROR: Failed to
// materialize presentation from generation" instead of the generic "The service
// was not able to process your request".
type ChronicleErrorBody = {
	error?: { code?: string; message?: string; status?: number };
};

export function extractChronicleErrorMessage(error: unknown): string | undefined {
	if (typeof error !== 'object' || error === null) return undefined;
	const err = error as {
		response?: { body?: ChronicleErrorBody | string };
		cause?: { error?: ChronicleErrorBody['error'] } | ChronicleErrorBody;
		description?: string;
	};

	const candidates: (ChronicleErrorBody | undefined)[] = [];
	const raw = err.response?.body;
	if (typeof raw === 'string') {
		try {
			candidates.push(JSON.parse(raw) as ChronicleErrorBody);
		} catch {
			// not JSON — skip
		}
	} else if (raw && typeof raw === 'object') {
		candidates.push(raw);
	}
	if (err.cause && 'error' in err.cause) {
		candidates.push(err.cause as ChronicleErrorBody);
	}

	for (const c of candidates) {
		const message = c?.error?.message;
		if (message) {
			const code = c.error?.code;
			return code ? `${code}: ${message}` : message;
		}
	}
	return undefined;
}
