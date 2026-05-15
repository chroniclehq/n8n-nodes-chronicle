import type { IBinaryData, IExecuteFunctions } from 'n8n-workflow';

export type CreateTargetResponse = {
	url: string;
	fields: Array<{ name: string; value: string }>;
	path: string;
	download_url: string;
};

// Isolated S3 multipart helper. MUST NOT reference credentials in this scope —
// the @n8n/eslint-plugin-community-nodes `no-http-request-with-manual-auth` rule
// is scope-based and would flag any getCredentials() call alongside the raw
// httpRequest() used here for the S3 leg.
export async function uploadToS3(
	helpers: IExecuteFunctions['helpers'],
	target: CreateTargetResponse,
	buffer: Buffer,
	binary: IBinaryData,
): Promise<void> {
	const form = new FormData();

	// Append fields in the exact order returned by the API.
	for (const f of target.fields) {
		form.append(f.name, f.value);
	}

	// File MUST be last.
	const mimeType = binary.mimeType ?? 'application/octet-stream';
	form.append(
		'file',
		new Blob([new Uint8Array(buffer)], { type: mimeType }),
		binary.fileName ?? 'upload',
	);

	// Do NOT set Content-Type manually — undici sets the boundary.
	await helpers.httpRequest({
		method: 'POST',
		url: target.url,
		body: form,
	});
}
