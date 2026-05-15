import type { INodeProperties } from 'n8n-workflow';

export const getStatusDescription: INodeProperties[] = [
	{
		displayName: 'Generation ID',
		name: 'generation_id',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 7f8c4a32-...',
		description: 'The generation_id returned by Generate (Async)',
		displayOptions: {
			show: {
				resource: ['presentation'],
				operation: ['getStatus'],
			},
		},
	},
];
