import { randomInt } from "node:crypto";

const LOWERCASE = "abcdefghijkmnpqrstuvwxyz";
const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const NUMBERS = "23456789";
const SYMBOLS = "!@#$%^&*_-+=?";

/**
 * Controls which character groups can be used when generating a password.
 */
export interface CharacterGroups {
  /** Include lowercase letters. */
  lowercase: boolean;
  /** Include numeric digits. */
  numbers: boolean;
  /** Include symbol characters. */
  symbols: boolean;
  /** Include uppercase letters. */
  uppercase: boolean;
}

/**
 * User-provided password generation options.
 *
 * Omitted options fall back to {@link DEFAULT_PASSWORD_OPTIONS}.
 */
export interface PasswordOptions extends Partial<CharacterGroups> {
  /** Allow visually ambiguous characters such as `0`, `O`, `1`, `l`, and `I`. */
  ambiguous?: boolean;
  /** Desired password length. Must be a positive integer. */
  length?: number;
}

/**
 * Fully resolved password options after defaults and validation have been applied.
 */
export interface NormalizedPasswordOptions extends CharacterGroups {
  /** Whether visually ambiguous characters are allowed. */
  ambiguous: boolean;
  /** Password length as a positive integer. */
  length: number;
}

/**
 * Default password generation settings.
 */
export const DEFAULT_PASSWORD_OPTIONS: NormalizedPasswordOptions = {
  ambiguous: false,
  length: 20,
  lowercase: true,
  numbers: true,
  symbols: true,
  uppercase: true,
};

const AMBIGUOUS_CHARACTERS = new Set(["0", "O", "o", "1", "l", "I"]);

/**
 * Applies defaults and validates password generation options.
 *
 * @param options - Partial password options supplied by a caller.
 * @returns A normalized options object with every setting populated.
 * @throws If the length is invalid, no character groups are enabled, or the
 * length cannot include at least one character from each enabled group.
 */
export function normalizePasswordOptions(options: PasswordOptions = {}): NormalizedPasswordOptions {
  const normalized = { ...DEFAULT_PASSWORD_OPTIONS };

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined) {
      Object.assign(normalized, { [key]: value });
    }
  }

  if (!Number.isInteger(normalized.length) || normalized.length < 1) {
    throw new Error("Password length must be a positive integer.");
  }

  const groups = getCharacterGroups(normalized);

  if (groups.length === 0) {
    throw new Error("At least one character group must be enabled.");
  }

  if (normalized.length < groups.length) {
    throw new Error("Password length must be at least the number of enabled character groups.");
  }

  return normalized;
}

/**
 * Generates a cryptographically secure random password.
 *
 * The result contains at least one character from each enabled character group.
 *
 * @param options - Password generation options.
 * @returns A generated password.
 * @throws If the supplied options are invalid.
 */
export function generatePassword(options: PasswordOptions = {}): string {
  const normalized = normalizePasswordOptions(options);
  const groups = getCharacterGroups(normalized);
  const pool = groups.join("");
  const characters: string[] = [];

  for (const group of groups) {
    characters.push(pickCharacter(group));
  }

  while (characters.length < normalized.length) {
    characters.push(pickCharacter(pool));
  }

  shuffle(characters);

  return characters.join("");
}

/**
 * Estimates password entropy in bits from the enabled character pool and length.
 *
 * @param options - Password generation options.
 * @returns The estimated entropy in bits.
 * @throws If the supplied options are invalid.
 */
export function estimateEntropyBits(options: PasswordOptions = {}): number {
  const normalized = normalizePasswordOptions(options);
  const poolSize = getCharacterGroups(normalized).join("").length;

  return normalized.length * Math.log2(poolSize);
}

function getCharacterGroups(options: NormalizedPasswordOptions): string[] {
  const groups: string[] = [];

  if (options.lowercase) {
    groups.push(filterAmbiguous(LOWERCASE, options.ambiguous));
  }

  if (options.uppercase) {
    groups.push(filterAmbiguous(UPPERCASE, options.ambiguous));
  }

  if (options.numbers) {
    groups.push(filterAmbiguous(NUMBERS, options.ambiguous));
  }

  if (options.symbols) {
    groups.push(filterAmbiguous(SYMBOLS, options.ambiguous));
  }

  return groups.filter((group) => group.length > 0);
}

function filterAmbiguous(characters: string, allowAmbiguous: boolean): string {
  if (allowAmbiguous) {
    return characters;
  }

  return characters
    .split("")
    .filter((character) => !AMBIGUOUS_CHARACTERS.has(character))
    .join("");
}

function pickCharacter(characters: string): string {
  const character = characters[randomInt(characters.length)];

  if (character === undefined) {
    throw new Error("Cannot select a character from an empty character set.");
  }

  return character;
}

function shuffle(characters: string[]): void {
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex]!, characters[index]!];
  }
}
