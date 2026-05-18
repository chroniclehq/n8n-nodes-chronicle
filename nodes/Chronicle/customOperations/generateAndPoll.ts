import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeApiError, NodeOperationError, sleep } from 'n8n-workflow';

import { chronicleApiRequest, extractChronicleErrorMessage } from '../shared/transport';

const POLL_INTERVAL_MS = 3000;
const MAX_DURATION_MS = 10 * 60 * 1000;

type Attachment = { id: string; url: string; file_name: string; type: string };

type GenerateBody = {
	prompt: string;
	non_interactive: true;
	template_id?: string;
	attachments?: Attachment[];
	narrative_type?: string;
	rewrite_style?: string;
	section_count?: number | string;
	language?: string;
};

type StartResponse = { generation_id: string; status: string; poll_url?: string };

type StatusResponse = {
	generation_id: string;
	status: 'generating' | 'awaiting_input' | 'completed' | 'failed';
	phase?: 'storyline' | 'slides';
	message?: string;
	error?: string;
	progress?: { slides_total: number; slides_completed: number; current_step: string };
	presentation?: IDataObject;
	tokens_used?: number;
};

// Single body builder for both poll ops. Branches on operation so each op only
// reads parameters that are actually present in its UI gate.
function buildBody(ctx: IExecuteFunctions, i: number, operation: string): GenerateBody {
	const prompt = ctx.getNodeParameter('prompt', i) as string;
	const body: GenerateBody = { prompt, non_interactive: true };

	const attachmentsParam = ctx.getNodeParameter('attachments', i, {}) as {
		attachment?: Attachment[];
	};
	if (attachmentsParam?.attachment && attachmentsParam.attachment.length > 0) {
		body.attachments = attachmentsParam.attachment;
	}

	if (operation === 'createFromTemplateAndPoll') {
		const templateRl = ctx.getNodeParameter('template_id', i) as { value?: string };
		const templateId = templateRl?.value;
		if (!templateId) {
			throw new NodeOperationError(ctx.getNode(), 'Template is required for this operation', {
				itemIndex: i,
			});
		}
		body.template_id = templateId;
	} else {
		// generateAndPoll — prompt-only path with storyline prefs
		const narrativeType = ctx.getNodeParameter('narrative_type', i, 'Auto') as string;
		const rewriteStyle = ctx.getNodeParameter('rewrite_style', i, 'Subtle') as string;
		const sectionCount = ctx.getNodeParameter('section_count', i, 'auto') as number | string;
		const language = ctx.getNodeParameter('language', i, 'us') as string;
		if (narrativeType) body.narrative_type = narrativeType;
		if (rewriteStyle) body.rewrite_style = rewriteStyle;
		if (sectionCount !== undefined && sectionCount !== '') body.section_count = sectionCount;
		if (language) body.language = language;
	}

	return body;
}

// Single handler shared by both poll ops via customOperations dispatch.
// The framework hands us the operation name on getNodeParameter('operation', i).
export async function generateAndPoll(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;

	for (let i = 0; i < items.length; i++) {
		try {
			const body = buildBody(this, i, operation);

			this.sendMessageToUI('Starting generation…');
			const startResp = (await chronicleApiRequest.call(
				this,
				'POST',
				'/api/v1/presentations/generate',
				body,
			)) as StartResponse;

			const generationId = startResp.generation_id;
			this.sendMessageToUI(`Generation queued (id: ${generationId}). Polling…`);

			const start = Date.now();
			let lastStatus: StatusResponse | undefined;
			let attempt = 0;
			let lastPhase: string | undefined;

			while (Date.now() - start < MAX_DURATION_MS) {
				await sleep(POLL_INTERVAL_MS);
				attempt += 1;

				lastStatus = (await chronicleApiRequest.call(
					this,
					'GET',
					`/api/v1/presentations/generate/${generationId}/status`,
				)) as StatusResponse;

				const elapsed = Math.round((Date.now() - start) / 1000);
				const phase = lastStatus.phase;
				const progress = lastStatus.progress;
				let line = `[${elapsed}s] status=${lastStatus.status}`;
				if (phase) line += ` phase=${phase}`;
				if (progress) line += ` slides=${progress.slides_completed}/${progress.slides_total}`;

				// Only emit on every poll if the phase changed, otherwise every 5th poll (~15s)
				// to keep the panel readable but still alive.
				if (phase !== lastPhase || attempt % 5 === 0) {
					this.sendMessageToUI(line);
					lastPhase = phase;
				}

				if (lastStatus.status === 'completed') {
					this.sendMessageToUI(`Completed in ${elapsed}s`);
					returnData.push({
						json: (lastStatus.presentation ?? {}) as IDataObject,
						pairedItem: { item: i },
					});
					break;
				}

				if (lastStatus.status === 'failed') {
					this.sendMessageToUI(`Failed: ${lastStatus.error ?? 'unknown'}`);
					throw new NodeApiError(
						this.getNode(),
						{ message: lastStatus.error ?? 'Generation failed' },
						{ itemIndex: i },
					);
				}

				if (lastStatus.status === 'awaiting_input') {
					throw new NodeOperationError(
						this.getNode(),
						'Chronicle returned awaiting_input despite non_interactive=true',
						{
							itemIndex: i,
							description:
								'This should not happen — non_interactive is hardcoded for poll ops. Open an issue.',
						},
					);
				}
				// status === 'generating' → keep polling
			}

			if (!lastStatus || lastStatus.status !== 'completed') {
				throw new NodeOperationError(this.getNode(), 'Generation timed out after 10 minutes', {
					itemIndex: i,
				});
			}
		} catch (error) {
			const chronicleMessage = extractChronicleErrorMessage(error);
			if (chronicleMessage) {
				this.sendMessageToUI(`Chronicle error: ${chronicleMessage}`);
			}
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: chronicleMessage ?? (error as Error).message },
					pairedItem: { item: i },
				});
				continue;
			}
			if (error instanceof NodeApiError || error instanceof NodeOperationError) {
				// eslint-disable-next-line @n8n/community-nodes/require-node-api-error
				throw error;
			}
			throw new NodeApiError(
				this.getNode(),
				{ message: chronicleMessage ?? (error as Error).message },
				{ itemIndex: i },
			);
		}
	}

	return [returnData];
}
