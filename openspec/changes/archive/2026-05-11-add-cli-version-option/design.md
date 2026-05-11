## Context

`passgen` already exposes a CLI with help and generation options. Users installing from npm need a standard `-V` / `--version` command to confirm the installed package version after publishing or upgrading.

## Goals / Non-Goals

**Goals:**

- Add `-V` and `--version` flags to the CLI.
- Print the current package version as a single stdout line.
- Exit before password generation when version is requested.
- Cover version behavior with colocated `node:test` tests.

**Non-Goals:**

- No change to password generation defaults or security behavior.
- No change to package publish workflow beyond reading the package version.
- No additional runtime dependency.

## Decisions

1. Treat version as an informational command.
   - `-V` and `--version` take precedence like `--help`.
   - The CLI prints only the semver string plus a trailing newline.
   - Alternative considered: print `passgen <version>`, rejected because script-friendly output is easier to consume.

2. Read the version from package metadata.
   - The implementation should avoid duplicating a hard-coded version in CLI source.
   - A small helper can read `package.json` relative to the CLI source tree or otherwise expose the package version through a generated/imported constant.
   - Alternative considered: hard-code the version. That risks drift on future releases.

3. Keep tests on Node built-ins.
   - Add `node:test` and `node:assert/strict` coverage for both `-V` and `--version`.
   - The test should compare CLI output with the current `package.json` version.

## Risks / Trade-offs

- Package metadata path differs between source and built output -> test the built CLI path used by the package bin.
- Reading package metadata at runtime introduces a small file read -> acceptable because `--version` is a lightweight informational command and does not affect password generation.
