import type { INodeProperties } from 'n8n-workflow';

import { getStatusDescription } from './getStatus';
import {
	attachmentsField,
	nonInteractiveHiddenField,
	promptField,
	storylinePreferencesFields,
	templateIdFieldOptional,
	templateIdFieldRequired,
} from './shared';

const showForResource = { resource: ['presentation'] };

export const presentationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForResource },

		options: [
			{
				name: 'Generate & Poll',
				value: 'generateAndPoll',
				action: 'Generate a presentation and poll',
				description: 'Generate a deck from a prompt (no template) and poll until it completes',
				// Routing is bypassed — handled by customOperations.presentation.generateAndPoll
				routing: {
					request: {
						method: 'POST',
						url: '/api/v1/presentations/generate',
					},
				},
			},
			{
				name: 'Create From Template & Poll',
				value: 'createFromTemplateAndPoll',
				action: 'Create from template and poll',
				description: 'Generate a deck from a template plus a prompt and poll until it completes',
				// Routing is bypassed — handled by customOperations.presentation.createFromTemplateAndPoll
				routing: {
					request: {
						method: 'POST',
						url: '/api/v1/presentations/generate',
					},
				},
			},
			{
				name: 'Generate (Async)',
				value: 'generate',
				action: 'Generate a presentation',
				description: 'Start a generation (with optional template) and return a generation_id',
				routing: {
					request: {
						method: 'POST',
						url: '/api/v1/presentations/generate',
					},
				},
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				action: 'Get generation status',
				description: 'Check the status of an in-flight generation',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/presentations/generate/{{$parameter["generation_id"]}}/status',
					},
				},
			},
		],
		default: 'generateAndPoll',
	},

	// Shared fields — each carries its own displayOptions targeting the ops it applies to
	promptField,
	templateIdFieldRequired,
	templateIdFieldOptional,
	attachmentsField,
	nonInteractiveHiddenField,
	...storylinePreferencesFields,

	// Op-specific fields
	...getStatusDescription,
];
