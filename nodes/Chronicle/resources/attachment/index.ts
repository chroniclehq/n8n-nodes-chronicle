import type { INodeProperties } from 'n8n-workflow';

import { uploadDescription } from './upload';

export const attachmentDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['attachment'] } },
		options: [
			{
				name: 'Upload',
				value: 'upload',
				action: 'Upload an attachment',
				description: 'Upload a file from the previous node\'s binary output to Chronicle, ready to attach to Generate',
				// Routing is bypassed — handled by customOperations.attachment.upload
				routing: {
					request: {
						method: 'POST',
						url: '/api/v1/uploads/create-target',
					},
				},
			},
		],
		default: 'upload',
	},
	...uploadDescription,
];
