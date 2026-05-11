## Why

Developers need a small, script-friendly password generator that can produce strong passwords from the terminal without opening a web UI or manually configuring common security defaults.

## What Changes

- Add a `passgen` CLI entrypoint for the `@xqvvu/passgen` package.
- Generate one strong random password by default with clean stdout output.
- Support common CLI options for length, count, character groups, ambiguous characters, entropy display, JSON output, and clipboard copy.
- Expose a reusable TypeScript API for password generation and entropy calculation.
- Use cryptographically secure randomness for all password selection and shuffling.

## Capabilities

### New Capabilities

- `cli-password-generation`: Covers secure CLI password generation, output formatting, option handling, and reusable generation APIs.

### Modified Capabilities

- None.

## Impact

- Affected code: package metadata, CLI entrypoint, TypeScript source, build output.
- Affected APIs: new exported password generation functions and CLI flags.
- Dependencies: may add a small CLI argument parser and clipboard integration if needed.
