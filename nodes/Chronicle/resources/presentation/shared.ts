import type { INodeProperties } from 'n8n-workflow';

export const NARRATIVE_TYPE_OPTIONS = [
	{ name: 'Auto', value: 'Auto', description: 'Let Chronicle pick' },
	{ name: 'Pitch', value: 'Pitch' },
	{ name: 'Showcase', value: 'Showcase' },
	{ name: 'Sales', value: 'Sales' },
	{ name: 'Proposal', value: 'Proposal' },
	{ name: 'Research', value: 'Research' },
	{ name: 'Guide', value: 'Guide' },
	{ name: 'Meeting', value: 'Meeting' },
	{ name: 'Portfolio', value: 'Portfolio' },
] as const;

export const REWRITE_STYLE_OPTIONS = [
	{ name: 'Subtle', value: 'Subtle', description: 'Light edits, preserve voice' },
	{ name: 'Strong', value: 'Strong', description: 'Rewrite for clarity and impact' },
	{ name: 'Preserve', value: 'Preserve', description: 'Keep input text unchanged' },
] as const;

export const LANGUAGE_OPTIONS = [
	{ name: 'English (US)', value: 'us' },
	{ name: 'English (UK)', value: 'uk' },
	{ name: 'Spanish', value: 'es' },
	{ name: 'French', value: 'fr' },
	{ name: 'German', value: 'de' },
	{ name: 'Italian', value: 'it' },
	{ name: 'Portuguese', value: 'pt' },
	{ name: 'Chinese', value: 'cn' },
	{ name: 'Hindi (India)', value: 'in' },
	{ name: 'Japanese', value: 'ja' },
	{ name: 'Korean', value: 'ko' },
	{ name: 'Arabic', value: 'ar' },
	{ name: 'Hindi', value: 'hi' },
	{ name: 'Bengali', value: 'bn' },
] as const;

// Operation buckets — keep in sync with operation values in index.ts
const PROMPT_OPS = ['generateAndPoll', 'createFromTemplateAndPoll', 'generate'];
const ATTACHMENT_OPS = ['generateAndPoll', 'createFromTemplateAndPoll', 'generate'];
const OPTIONAL_TEMPLATE_OPS = ['generate'];
const REQUIRED_TEMPLATE_OPS = ['createFromTemplateAndPoll'];
const STORYLINE_OPS = ['generateAndPoll', 'generate'];

/* eslint-disable n8n-nodes-base/node-param-default-missing */
// Resource locator modes are typed as INodePropertyMode which doesn't accept
// a `default` field. The default-missing lint rule misfires on these objects;
// the disable above scopes the suppression to the array.
const TEMPLATE_MODES: INodeProperties['modes'] = [
	{
		displayName: 'From List',
		name: 'list',
		type: 'list',
		placeholder: 'Select a template...',
		typeOptions: {
			searchListMethod: 'getTemplates',
			searchable: true,
			searchFilterRequired: false,
		},
	},
	{
		displayName: 'By ID',
		name: 'id',
		type: 'string',
		placeholder: 'e.g. tpl_abc123',
		validation: [
			{
				type: 'regex',
				properties: {
					regex: '^[a-zA-Z0-9_-]+$',
					errorMessage: 'Template ID must be alphanumeric (with optional - or _)',
				},
			},
		],
	},
];
/* eslint-enable n8n-nodes-base/node-param-default-missing */

export const promptField: INodeProperties = {
	displayName: 'Prompt',
	name: 'prompt',
	type: 'string',
	typeOptions: { rows: 6 },
	required: true,
	default: '',
	placeholder: 'e.g. A 5-slide pitch deck for our new product',
	description: 'What you want Chronicle to generate',
	displayOptions: { show: { resource: ['presentation'], operation: PROMPT_OPS } },
	routing: {
		send: { type: 'body', property: 'prompt' },
	},
};

export const templateIdFieldOptional: INodeProperties = {
	displayName: 'Template',
	name: 'template_id',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	description: 'Optional. Pick a Chronicle template, or leave blank to generate from prompt only.',
	displayOptions: { show: { resource: ['presentation'], operation: OPTIONAL_TEMPLATE_OPS } },
	modes: TEMPLATE_MODES,
	routing: {
		send: { type: 'body', property: 'template_id' },
	},
};

export const templateIdFieldRequired: INodeProperties = {
	displayName: 'Template',
	name: 'template_id',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'The Chronicle template to use as a structural scaffold for the deck',
	displayOptions: { show: { resource: ['presentation'], operation: REQUIRED_TEMPLATE_OPS } },
	modes: TEMPLATE_MODES,
};

export const attachmentsField: INodeProperties = {
	displayName: 'Attachments',
	name: 'attachments',
	type: 'fixedCollection',
	typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Attachment' },
	default: {},
	description:
		'Files to ground the generation. Upload via the Chronicle: Upload Attachment op, then map the output here.',
	displayOptions: { show: { resource: ['presentation'], operation: ATTACHMENT_OPS } },
	options: [
		{
			name: 'attachment',
			displayName: 'Attachment',
			values: [
				{
					displayName: 'ID',
					name: 'id',
					type: 'string',
					default: '',
					required: true,
					description: 'Attachment ID returned by the Upload op',
				},
				{
					displayName: 'URL',
					name: 'url',
					type: 'string',
					default: '',
					required: true,
					description: 'Download URL returned by the Upload op',
				},
				{
					displayName: 'File Name',
					name: 'file_name',
					type: 'string',
					default: '',
					required: true,
				},
				{
					displayName: 'Type',
					name: 'type',
					type: 'string',
					default: '',
					required: true,
					placeholder: 'e.g. application/pdf',
				},
			],
		},
	],
	routing: {
		send: {
			type: 'body',
			property: 'attachments',
			value: '={{$value.attachment}}',
		},
	},
};

// Hidden field for the async Generate op that forces non_interactive=true into the body
// via declarative routing. The two poll ops handle non_interactive directly in their
// customOperation handler so they don't need this field.
export const nonInteractiveHiddenField: INodeProperties = {
	displayName: 'Non-Interactive (Forced)',
	name: 'non_interactive',
	type: 'hidden',
	default: true,
	displayOptions: { show: { resource: ['presentation'], operation: ['generate'] } },
	routing: {
		send: { type: 'body', property: 'non_interactive' },
	},
};

const storylineDisplay = {
	show: { resource: ['presentation'], operation: STORYLINE_OPS },
};

export const narrativeTypeField: INodeProperties = {
	displayName: 'Narrative Type',
	name: 'narrative_type',
	type: 'options',
	options: NARRATIVE_TYPE_OPTIONS as unknown as INodeProperties['options'],
	default: 'Auto',
	description: 'Shapes the narrative archetype Chronicle uses to outline the deck',
	displayOptions: storylineDisplay,
	routing: {
		send: { type: 'body', property: 'narrative_type' },
	},
};

export const rewriteStyleField: INodeProperties = {
	displayName: 'Rewrite Style',
	name: 'rewrite_style',
	type: 'options',
	options: REWRITE_STYLE_OPTIONS as unknown as INodeProperties['options'],
	default: 'Subtle',
	description: 'How heavily Chronicle should rewrite your input text',
	displayOptions: storylineDisplay,
	routing: {
		send: { type: 'body', property: 'rewrite_style' },
	},
};

export const sectionCountField: INodeProperties = {
	displayName: 'Section Count',
	name: 'section_count',
	type: 'string',
	default: 'auto',
	placeholder: 'auto or a positive integer',
	description: 'Number of sections in the deck. Use "auto" to let Chronicle decide.',
	displayOptions: storylineDisplay,
	routing: {
		send: {
			type: 'body',
			property: 'section_count',
			value: '={{ $value === "auto" ? "auto" : Number($value) }}',
		},
	},
};

export const languageField: INodeProperties = {
	displayName: 'Language',
	name: 'language',
	type: 'options',
	options: LANGUAGE_OPTIONS as unknown as INodeProperties['options'],
	default: 'us',
	description: 'Language for the generated deck',
	displayOptions: storylineDisplay,
	routing: {
		send: { type: 'body', property: 'language' },
	},
};

export const storylinePreferencesFields: INodeProperties[] = [
	narrativeTypeField,
	rewriteStyleField,
	sectionCountField,
	languageField,
];
