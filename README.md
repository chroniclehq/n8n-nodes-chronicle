# @chroniclehq/n8n-nodes-chronicle

Official [n8n](https://n8n.io) community node for [Chronicle](https://chroniclehq.com) — generate AI-powered presentations and decks from your workflows.

## Installation

In n8n: **Settings → Community Nodes → Install** and enter `@chroniclehq/n8n-nodes-chronicle`.

For self-hosted installations, see [n8n's community node docs](https://docs.n8n.io/integrations/community-nodes/installation/).

## Credentials

1. In Chronicle, go to **Workspace Settings → API Keys** and create a key.
2. In n8n, create a new **Chronicle API** credential and paste the key (starts with `chr_`).
3. The default base URL is `https://api.chroniclehq.com`. Change it only if you're on a self-hosted Chronicle deployment.

Click **Test** on the credential to verify it works before saving.

## Operations

### Presentation

- **Generate a presentation and poll** — generate a deck from a prompt and wait for it to complete. Returns the full presentation (including the URL) when done. Use this when you want a synchronous "in → out" flow.
- **Create from template and poll** — generate a deck from a Chronicle template plus a prompt, and wait for completion. Returns the full presentation. Use this when you have a template-based design system.
- **Generate a presentation** — start a generation (with optional template) and return a `generation_id` immediately. Use this when you want to fan out generations and check their status later.
- **Get generation status** — check the status of a generation by ID. Returns one of `generating`, `completed`, or `failed`, with progress info when available.

### Attachment

- **Upload an attachment** — upload a file from a previous node's binary output to Chronicle, returning an attachment object (`id`, `url`, `file_name`, `type`) ready to drop into the Attachments field of any Generate op. PDFs, .pptx, .txt, .md, and images are all supported.

### Template

- **List templates** — list templates available to your workspace. Also powers the template picker dropdown inside the Generate ops.

## Storyline preferences

When using `Generate a presentation and poll` or `Generate a presentation` **without a template**, you can shape how Chronicle plans the deck by setting any of:

- **Narrative Type** — `Auto`, `Pitch`, `Showcase`, `Sales`, `Proposal`, `Research`, `Guide`, `Meeting`, `Portfolio`
- **Rewrite Style** — `Strong`, `Subtle`, `Preserve`
- **Section Count** — a positive integer or `auto`
- **Language** — one of the 14 supported language codes (`us`, `uk`, `es`, `fr`, `de`, `it`, `pt`, `cn`, `in`, `ja`, `ko`, `ar`, `hi`, `bn`)

These are server-side ignored when a template is selected (the template's structure takes over).

## Common workflows

**Generate from a prompt (simplest)**

```
Manual Trigger  →  Chronicle: Generate a presentation and poll  →  Set { deck_url }
```

**Generate from an uploaded PDF + template**

```
Webhook / Form / Chat Trigger  →  Chronicle: Upload an attachment  →  Chronicle: Create from template and poll  →  Reply with the URL
```

**Bulk generation with async + status check**

```
Read rows from Google Sheets  →  Chronicle: Generate (async)  →  Save generation_id to sheet

— separate scheduled workflow —
Read rows where status='generating'  →  Chronicle: Get generation status  →  Update sheet with URL when done
```

## AI agent / tool use

This node has `usableAsTool: true`, so it's available to n8n's AI agents. An agent can call Generate ops directly when configured as a tool.

## Resources

- [Chronicle developer docs](https://developers.chroniclehq.com)
- [n8n community node guide](https://docs.n8n.io/integrations/community-nodes/)
- [Report an issue](https://github.com/chroniclehq/n8n-nodes-chronicle/issues)

## License

[MIT](./LICENSE.md)
