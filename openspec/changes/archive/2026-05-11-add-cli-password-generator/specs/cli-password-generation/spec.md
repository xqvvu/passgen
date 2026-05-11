## ADDED Requirements

### Requirement: Default secure password generation

The system SHALL provide a `passgen` CLI command that generates one strong random password using cryptographically secure randomness when invoked without options.

#### Scenario: Generate one default password

- **WHEN** the user runs `passgen`
- **THEN** the system outputs exactly one password line to stdout
- **AND** the password length is 20 characters
- **AND** the password contains at least one lowercase letter, one uppercase letter, one number, and one symbol
- **AND** the password excludes ambiguous characters by default

### Requirement: Configurable generation options

The system SHALL allow users to configure generated passwords with CLI options for length, count, enabled character groups, and ambiguous characters.

#### Scenario: Generate multiple passwords

- **WHEN** the user runs `passgen --count 3`
- **THEN** the system outputs exactly three password lines to stdout

#### Scenario: Generate a specific length

- **WHEN** the user runs `passgen --length 32`
- **THEN** the generated password is 32 characters long

#### Scenario: Disable symbols

- **WHEN** the user runs `passgen --no-symbols`
- **THEN** the generated password contains no symbol characters
- **AND** the password contains at least one lowercase letter, one uppercase letter, and one number

#### Scenario: Allow ambiguous characters

- **WHEN** the user runs `passgen --ambiguous`
- **THEN** the generated password may include ambiguous characters from enabled character groups

### Requirement: Script-friendly output

The system SHALL keep default plaintext stdout suitable for shell scripts and provide explicit options for metadata output.

#### Scenario: Plain output contains passwords only

- **WHEN** the user runs `passgen --count 2`
- **THEN** stdout contains only two generated password lines
- **AND** stdout does not include labels, strength descriptions, or explanatory text

#### Scenario: JSON output

- **WHEN** the user runs `passgen --json`
- **THEN** stdout is valid JSON
- **AND** the JSON includes the generated password and entropy estimate

#### Scenario: Entropy output

- **WHEN** the user runs `passgen --entropy`
- **THEN** stdout includes the generated password and entropy estimate

### Requirement: Clipboard support

The system SHALL support copying a generated password to the system clipboard when requested.

#### Scenario: Copy one password

- **WHEN** the user runs `passgen --copy`
- **THEN** the system copies the generated password to the clipboard if a supported clipboard command is available
- **AND** stdout remains script-friendly

### Requirement: Reusable generation API

The package SHALL export TypeScript functions for generating passwords and estimating entropy independently from CLI execution.

#### Scenario: Generate through package API

- **WHEN** a consumer imports the package API and calls the password generation function with a valid options object
- **THEN** the function returns a password matching the requested options

#### Scenario: Reject impossible generation options

- **WHEN** the user or API requests a password length shorter than the number of required enabled character groups
- **THEN** the system rejects the request with a clear validation error
