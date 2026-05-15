import type { INodeProperties } from 'n8n-workflow';

// Upload is implemented in customOperations.attachment.upload. The fields below
// are pure UI; the routing is overridden by the custom op.
export const uploadDescription: INodeProperties[] = [
	{
		displayName: 'Input Data Field Name',
		name: 'input_data_field_name',
		type: 'string',
		required: true,
		default: 'data',
		description: 'The binary property in the input data to upload (typically `data` for the previous node\'s binary output)',
		displayOptions: {
			show: {
				resource: ['attachment'],
				operation: ['upload'],
			},
		},
	},
];
