import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';

import { chronicleApiRequest } from '../shared/transport';

type Template = {
	id: string;
	name: string;
	description?: string;
	preview_url?: string | null;
};

export async function getTemplates(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const response = (await chronicleApiRequest.call(this, 'GET', '/api/v1/templates')) as {
		templates: Template[];
	};

	const lowered = filter?.toLowerCase();
	const filtered = lowered
		? response.templates.filter((t) => t.name.toLowerCase().includes(lowered))
		: response.templates;

	const results: INodeListSearchItems[] = filtered.map((t) => ({
		name: t.name,
		value: t.id,
		...(t.preview_url ? { url: t.preview_url } : {}),
	}));

	return { results };
}
