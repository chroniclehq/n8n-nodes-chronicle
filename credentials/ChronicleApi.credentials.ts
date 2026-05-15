import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ChronicleApi implements ICredentialType {
	name = 'chronicleApi';

	displayName = 'Chronicle API';

	documentationUrl = 'https://developers.chroniclehq.com/authentication';

	icon: Icon = {
		light: 'file:../nodes/Chronicle/chronicle.svg',
		dark: 'file:../nodes/Chronicle/chronicle.dark.svg',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Chronicle API key. Create one in Workspace Settings → API Keys.',
			placeholder: 'chr_...',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.chroniclehq.com',
			description: 'Chronicle API base URL. Change only if you are on a self-hosted deployment.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v1',
			method: 'GET',
		},
	};
}
