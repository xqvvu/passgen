import { match, ok, strictEqual, throws } from "node:assert/strict";
import { describe, test } from "node:test";

import { estimateEntropyBits, generatePassword, normalizePasswordOptions } from "./password.ts";

const ambiguousPattern = /[0Oo1lI]/;
const symbolPattern = /[!@#$%^&*_\-+=?]/;

void describe("generatePassword", () => {
  void test("generates a default strong password", () => {
    const password = generatePassword();

    strictEqual(password.length, 20);
    match(password, /[a-z]/);
    match(password, /[A-Z]/);
    match(password, /[0-9]/);
    match(password, symbolPattern);
    ok(!ambiguousPattern.test(password));
  });

  void test("honors length and disabled symbols", () => {
    const password = generatePassword({ length: 32, symbols: false });

    strictEqual(password.length, 32);
    match(password, /[a-z]/);
    match(password, /[A-Z]/);
    match(password, /[0-9]/);
    ok(!symbolPattern.test(password));
  });

  void test("rejects impossible group coverage", () => {
    throws(() => generatePassword({ length: 2 }), /at least the number of enabled character groups/);
  });

  void test("estimates entropy from normalized options", () => {
    ok(estimateEntropyBits({ length: 20 }) > 100);
  });
});

void describe("normalizePasswordOptions", () => {
  void test("rejects disabled character groups", () => {
    throws(
      () =>
        normalizePasswordOptions({
          lowercase: false,
          numbers: false,
          symbols: false,
          uppercase: false,
        }),
      /At least one character group/,
    );
  });
});
