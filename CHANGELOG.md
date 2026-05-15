# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-15

Initial release.

### Added

- **Chronicle API** credential with API key + configurable base URL, credential test endpoint
- **Presentation** resource with four operations:
  - `Generate & Poll` — generate a deck from a prompt and poll until completion
  - `Create from Template & Poll` — generate a deck from a template plus a prompt and poll until completion
  - `Generate (Async)` — start a generation (with optional template) and return a generation ID
  - `Get Status` — check the status of an in-flight generation
- **Attachment** resource with `Upload an attachment` op (binary file → Chronicle attachment object)
- **Template** resource with `List Templates` op, used to power the template picker in Generate ops
- Storyline preferences (narrative type, rewrite style, section count, language) for prompt-only generation paths
- `usableAsTool: true` — node is exposable to AI agents via n8n's tool calling
- Light + dark Chronicle icons

[Unreleased]: https://github.com/chroniclehq/n8n-nodes-chronicle/compare/0.1.0...HEAD
[0.1.0]: https://github.com/chroniclehq/n8n-nodes-chronicle/releases/tag/0.1.0
