# passgen

Secure, script-friendly password generation from the terminal.

## Install

```bash
npx @xqvvu/passgen
```

After global installation, use the `passgen` binary:

```bash
npm install -g @xqvvu/passgen
passgen
```

## Usage

```bash
passgen
passgen --length 32
passgen --count 5 --no-symbols
passgen --json
passgen --entropy
passgen --copy
passgen --version
```

By default, `passgen` prints one 20-character password and nothing else. It uses cryptographically secure randomness, includes lowercase letters, uppercase letters, numbers, and symbols, and excludes ambiguous characters such as `0`, `O`, `1`, `l`, and `I`.

## Options

| Option                  | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `-l, --length <number>` | Password length. Defaults to `20`.                              |
| `-n, --count <number>`  | Number of passwords to print. Defaults to `1`.                  |
| `--no-lowercase`        | Disable lowercase letters.                                      |
| `--no-uppercase`        | Disable uppercase letters.                                      |
| `--no-numbers`          | Disable numbers.                                                |
| `--no-symbols`          | Disable symbols.                                                |
| `--ambiguous`           | Allow ambiguous characters such as `0`, `O`, `1`, `l`, and `I`. |
| `--entropy`             | Print the generated password with its entropy estimate.         |
| `--json`                | Print JSON output.                                              |
| `--copy`                | Copy the first generated password to the system clipboard.      |
| `-V, --version`         | Show version.                                                   |
| `-h, --help`            | Show CLI help.                                                  |

Plain output is designed for shell scripts:

```bash
PASSWORD="$(passgen --length 24)"
```

## API

```ts
import { generatePassword } from "@xqvvu/passgen";

const password = generatePassword({ length: 24 });
```

Available exports:

- `generatePassword(options)`
- `estimateEntropyBits(options)`
- `normalizePasswordOptions(options)`
- `DEFAULT_PASSWORD_OPTIONS`
- `PasswordOptions`
- `NormalizedPasswordOptions`
- `CharacterGroups`

## Development

```bash
bun install
bun run fmt
bun run lint
bun run build
bun run test
```
