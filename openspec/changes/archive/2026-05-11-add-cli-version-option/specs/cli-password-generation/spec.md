## ADDED Requirements

### Requirement: CLI version reporting

The system SHALL allow users to print the installed `passgen` package version from the CLI without generating a password.

#### Scenario: Print version with short flag

- **WHEN** the user runs `passgen -V`
- **THEN** stdout contains exactly the current package version followed by a newline
- **AND** no password is generated

#### Scenario: Print version with long flag

- **WHEN** the user runs `passgen --version`
- **THEN** stdout contains exactly the current package version followed by a newline
- **AND** no password is generated
