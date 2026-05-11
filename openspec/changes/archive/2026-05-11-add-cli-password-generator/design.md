## Context

The package currently has minimal TypeScript/Bun scaffolding and no implemented password generation behavior. The requested product is a CLI-first package named `@xqvvu/passgen` that behaves well in terminals and scripts while using secure generation defaults.

## Goals / Non-Goals

**Goals:**

- Provide a `passgen` binary that prints strong passwords to stdout by default.
- Keep default output script-friendly: password lines only unless the user requests metadata.
- Implement generation in a reusable TypeScript core API separate from CLI parsing.
- Use cryptographically secure randomness for character selection and shuffling.
- Include focused validation and tests for security-sensitive behavior and CLI output.

**Non-Goals:**

- No web UI, browser extension, account storage, or password manager integration.
- No persisted config file in the first version.
- No word-based passphrase mode in the first version unless added by a later change.

## Decisions

1. Split core generation from CLI handling.
   - `src/index.ts` is the public package API entrypoint.
   - `src/lib/password.ts` handles option normalization, secure random selection, password generation, and entropy estimation.
   - `src/cli.ts` handles argv parsing, stdout/stderr formatting, JSON formatting, clipboard copy, and exit codes.
   - Alternative considered: put all logic in the executable. That would make tests and future library usage weaker.

2. Use Node/Bun `crypto.randomInt` for unbiased secure integer selection.
   - `randomInt(max)` avoids modulo bias and is available in Bun's Node compatibility layer.
   - Alternative considered: `Math.random`, rejected because it is not cryptographically secure.

3. Guarantee at least one character from every enabled character group when possible.
   - If lowercase, uppercase, numbers, and symbols are enabled, generated passwords include each group at least once.
   - The remaining positions are selected from the combined pool and then securely shuffled.
   - Alternative considered: pure random sampling from the combined pool. That is secure but can surprise users when selected groups are absent.

4. Default to strong, low-noise behavior.
   - Default length is 20.
   - Default enabled groups are lowercase, uppercase, numbers, and symbols.
   - Ambiguous characters are excluded by default.
   - Plain output prints only generated passwords, one per line.

5. Keep dependencies minimal.
   - CLI parsing can use `node:util` `parseArgs`.
   - Clipboard copy can use Bun's `$` helper to call the platform clipboard command when requested, avoiding a runtime dependency.

## Risks / Trade-offs

- Clipboard behavior differs by platform -> keep `--copy` best-effort with clear non-zero failure if no supported clipboard command exists.
- Excluding ambiguous characters reduces the character pool -> entropy remains high due to the default length and broad character groups.
- Guaranteeing group inclusion slightly changes pure distribution -> the generated result remains secure because all selections and shuffle operations use secure randomness.
- Strict script-friendly stdout means metadata cannot be printed in default mode -> expose `--entropy` and `--json` for users who want details.
