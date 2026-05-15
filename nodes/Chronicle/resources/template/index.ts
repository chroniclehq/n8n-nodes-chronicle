import type { INodeProperties } from 'n8n-workflow';

import { getManyDescription } from './getMany';

export const templateDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['template'] } },
		options: [
			{
				name: 'List Templates',
				value: 'getMany',
				action: 'List templates',
				description: 'List templates available to your workspace',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/templates',
					},
				},
			},
		],
		default: 'getMany',
	},
	...getManyDescription,
];
