## Why

CLI users need a standard way to inspect the installed `passgen` package version, especially after publishing and upgrading npm releases.

## What Changes

- Add `-V` and `--version` CLI options.
- Print the current package version to stdout and exit without generating a password.
- Keep version output script-friendly: the version line only, no labels or extra text.
- Document and test the new version flags.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `cli-password-generation`: Add version-reporting behavior to the existing CLI option surface.

## Impact

- Affected code: `src/cli.ts`, `src/cli.test.ts`, package metadata reading or generated version constant.
- Affected docs: `README.md`.
- Affected specs: `openspec/specs/cli-password-generation/spec.md` delta.
