#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { estimateEntropyBits, generatePassword, type PasswordOptions } from "./lib/password.ts";

interface CliOptions extends PasswordOptions {
  copy: boolean;
  count: number;
  entropy: boolean;
  help: boolean;
  json: boolean;
  version: boolean;
}

interface GeneratedPassword {
  password: string;
  entropyBits: number;
}

const HELP_TEXT = `Usage: passgen [options]

Options:
  -l, --length <number>     Password length (default: 20)
  -n, --count <number>      Number of passwords to generate (default: 1)
      --no-lowercase        Disable lowercase letters
      --no-uppercase        Disable uppercase letters
      --no-numbers          Disable numbers
      --no-symbols          Disable symbols
      --ambiguous           Allow ambiguous characters such as 0, O, 1, l, I
      --entropy             Print password and entropy estimate
      --json                Print JSON output
      --copy                Copy the first generated password to the clipboard
  -V, --version             Show version
  -h, --help                Show this help
`;

export async function main(argv = process.argv.slice(2)): Promise<number> {
  try {
    const cliOptions = parseCliOptions(argv);

    if (cliOptions.version) {
      process.stdout.write(`${readPackageVersion()}\n`);
      return 0;
    }

    if (cliOptions.help) {
      process.stdout.write(HELP_TEXT);
      return 0;
    }

    const passwordOptions = toPasswordOptions(cliOptions);
    const generated = generatePasswords(passwordOptions, cliOptions.count);

    if (cliOptions.copy) {
      copyToClipboard(generated[0]!.password);
    }

    process.stdout.write(formatOutput(generated, cliOptions));

    return 0;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

export function parseCliOptions(argv: string[]): CliOptions {
  const options: CliOptions = {
    copy: false,
    count: 1,
    entropy: false,
    help: false,
    json: false,
    version: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]!;

    switch (argument) {
      case "-h":
      case "--help":
        options.help = true;
        break;
      case "-V":
      case "--version":
        options.version = true;
        break;
      case "-l":
      case "--length":
        options.length = parsePositiveInteger(readValue(argv, index, argument), "length");
        index += 1;
        break;
      case "-n":
      case "--count":
        options.count = parsePositiveInteger(readValue(argv, index, argument), "count");
        index += 1;
        break;
      case "--lowercase":
        options.lowercase = true;
        break;
      case "--no-lowercase":
        options.lowercase = false;
        break;
      case "--uppercase":
        options.uppercase = true;
        break;
      case "--no-uppercase":
        options.uppercase = false;
        break;
      case "--numbers":
        options.numbers = true;
        break;
      case "--no-numbers":
        options.numbers = false;
        break;
      case "--symbols":
        options.symbols = true;
        break;
      case "--no-symbols":
        options.symbols = false;
        break;
      case "--ambiguous":
        options.ambiguous = true;
        break;
      case "--entropy":
        options.entropy = true;
        break;
      case "--json":
        options.json = true;
        break;
      case "--copy":
        options.copy = true;
        break;
      default:
        if (argument.startsWith("--length=")) {
          options.length = parsePositiveInteger(argument.slice("--length=".length), "length");
        } else if (argument.startsWith("--count=")) {
          options.count = parsePositiveInteger(argument.slice("--count=".length), "count");
        } else {
          throw new Error(`Unknown option: ${argument}`);
        }
    }
  }

  return options;
}

function generatePasswords(options: PasswordOptions, count: number): GeneratedPassword[] {
  const entropyBits = Number(estimateEntropyBits(options).toFixed(2));

  return Array.from({ length: count }, () => ({
    entropyBits,
    password: generatePassword(options),
  }));
}

function formatOutput(generated: GeneratedPassword[], options: Pick<CliOptions, "entropy" | "json">): string {
  if (options.json) {
    if (generated.length === 1) {
      return `${JSON.stringify(generated[0])}\n`;
    }

    return `${JSON.stringify({ passwords: generated })}\n`;
  }

  if (options.entropy) {
    return generated.map((item) => `${item.password}\t${item.entropyBits} bits`).join("\n") + "\n";
  }

  return generated.map((item) => item.password).join("\n") + "\n";
}

function toPasswordOptions(options: CliOptions): PasswordOptions {
  return {
    ambiguous: options.ambiguous,
    length: options.length,
    lowercase: options.lowercase,
    numbers: options.numbers,
    symbols: options.symbols,
    uppercase: options.uppercase,
  };
}

function readValue(argv: string[], index: number, optionName: string): string {
  const value = argv[index + 1];

  if (value === undefined || value.startsWith("-")) {
    throw new Error(`Missing value for ${optionName}.`);
  }

  return value;
}

function parsePositiveInteger(value: string, name: string): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${capitalize(name)} must be a positive integer.`);
  }

  return parsed;
}

function copyToClipboard(value: string): void {
  const command = clipboardCommand();

  if (command === undefined) {
    throw new Error("No supported clipboard command found for this platform.");
  }

  const result = spawnSync(command.command, command.args, {
    input: value,
    stdio: ["pipe", "ignore", "pipe"],
  });

  if (result.status !== 0) {
    throw new Error(`Failed to copy password to clipboard with ${command.command}.`);
  }
}

function clipboardCommand(): { command: string; args: string[] } | undefined {
  if (process.platform === "darwin") {
    return { args: [], command: "pbcopy" };
  }

  if (process.platform === "win32") {
    return { args: [], command: "clip" };
  }

  if (commandExists("wl-copy")) {
    return { args: [], command: "wl-copy" };
  }

  if (commandExists("xclip")) {
    return { args: ["-selection", "clipboard"], command: "xclip" };
  }

  if (commandExists("xsel")) {
    return { args: ["--clipboard", "--input"], command: "xsel" };
  }

  return undefined;
}

function commandExists(command: string): boolean {
  const shellCommand = process.platform === "win32" ? "where" : "command";
  const args = process.platform === "win32" ? [command] : ["-v", command];

  return spawnSync(shellCommand, args, { stdio: "ignore" }).status === 0;
}

function capitalize(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

function readPackageVersion(): string {
  const packagePath = findPackageJson(dirname(fileURLToPath(import.meta.url)));
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as { version?: unknown };

  if (typeof packageJson.version !== "string") {
    throw new Error("Package version is missing from package.json.");
  }

  return packageJson.version;
}

function findPackageJson(startDirectory: string): string {
  let directory = startDirectory;

  while (true) {
    const candidate = join(directory, "package.json");

    if (existsSync(candidate)) {
      return candidate;
    }

    const parent = dirname(directory);

    if (parent === directory) {
      throw new Error("Could not find package.json.");
    }

    directory = parent;
  }
}

function isDirectlyInvoked(): boolean {
  if (process.argv[1] === undefined) {
    return false;
  }

  return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
}

if (isDirectlyInvoked()) {
  process.exitCode = await main();
}
