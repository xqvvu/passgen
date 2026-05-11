## 1. Package Setup

- [x] 1.1 Update package metadata with `passgen` bin mapping and package exports.
- [x] 1.2 Create source module layout for core generation and CLI entrypoint.

## 2. Core Password Generation

- [x] 2.1 Implement option normalization, character groups, ambiguous-character filtering, and validation.
- [x] 2.2 Implement secure password generation with required group coverage and secure shuffling.
- [x] 2.3 Implement entropy estimation and exported TypeScript API.

## 3. CLI Behavior

- [x] 3.1 Implement CLI argument parsing for length, count, character-group toggles, ambiguous characters, entropy, JSON, copy, and help.
- [x] 3.2 Implement script-friendly plaintext, entropy, and JSON output formatting.
- [x] 3.3 Implement requested clipboard copy behavior with clear failure handling.

## 4. Verification

- [x] 4.1 Add focused automated tests for core generation, validation, and CLI output behavior.
- [x] 4.2 Run formatting, linting, build, tests, and OpenSpec validation.
