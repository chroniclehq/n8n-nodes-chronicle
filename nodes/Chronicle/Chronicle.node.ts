import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { generateAndPoll } from './customOperations/generateAndPoll';
import { upload } from './customOperations/upload';
import { getTemplates } from './listSearch/getTemplates';
import { attachmentDescription } from './resources/attachment';
import { presentationDescription } from './resources/presentation';
import { templateDescription } from './resources/template';

export class Chronicle implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chronicle',
		name: 'chronicle',
		icon: { light: 'file:chronicle.svg', dark: 'file:chronicle.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Generate AI-powered presentations with Chronicle',
		defaults: { name: 'Chronicle' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'chronicleApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Presentation', value: 'presentation' },
					{ name: 'Attachment', value: 'attachment' },
					{ name: 'Template', value: 'template' },
				],
				default: 'presentation',
			},
			...presentationDescription,
			...templateDescription,
			...attachmentDescription,
		],
	};

	methods = {
		listSearch: { getTemplates },
	};

	customOperations = {
		presentation: {
			generateAndPoll,
			// Both poll ops share the same handler — it branches on the operation parameter
			createFromTemplateAndPoll: generateAndPoll,
		},
		attachment: { upload },
	};
}
