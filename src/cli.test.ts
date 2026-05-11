import { match, ok, strictEqual } from "node:assert/strict";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { mkdirSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";

const decoder = new TextDecoder();

void describe("passgen CLI", () => {
  void test("prints one password by default", () => {
    const result = runCli();
    const output = stdout(result).trim();

    strictEqual(result.status, 0);
    strictEqual(output.split("\n").length, 1);
    strictEqual(output.length, 20);
  });

  void test("prints multiple plaintext password lines", () => {
    const result = runCli("--count", "3", "--no-symbols");
    const lines = stdout(result).trim().split("\n");

    strictEqual(result.status, 0);
    strictEqual(lines.length, 3);
    ok(lines.every((line) => line.length === 20));
    ok(lines.every((line) => !/[!@#$%^&*_\-+=?]/.test(line)));
  });

  void test("prints JSON metadata", () => {
    const result = runCli("--length", "24", "--json");
    const parsed = JSON.parse(stdout(result)) as { entropyBits: number; password: string };

    strictEqual(result.status, 0);
    strictEqual(parsed.password.length, 24);
    ok(parsed.entropyBits > 120);
  });

  void test("prints entropy metadata", () => {
    const result = runCli("--entropy");
    const output = stdout(result).trim();

    strictEqual(result.status, 0);
    match(output, /\t\d+(\.\d+)? bits$/);
  });

  void test("fails on unknown options", () => {
    const result = runCli("--unknown");

    strictEqual(result.status, 1);
    match(stderr(result), /Unknown option/);
  });

  void test("runs when invoked through a package bin symlink", () => {
    const binDir = join(tmpdir(), `passgen-test-${process.pid}-${Date.now()}`);
    const binPath = join(binDir, "passgen");

    mkdirSync(binDir);
    symlinkSync(join(process.cwd(), "dist/src/cli.js"), binPath);

    const result = spawnSync("node", [binPath, "--length", "12", "--no-symbols"]);
    const output = stdout(result).trim();

    strictEqual(result.status, 0);
    strictEqual(output.length, 12);
    ok(!/[!@#$%^&*_\-+=?]/.test(output));
  });
});

type SpawnResult = SpawnSyncReturns<Buffer>;

function runCli(...args: string[]): SpawnResult {
  return spawnSync("node", ["dist/src/cli.js", ...args]);
}

function stdout(result: SpawnResult): string {
  return decoder.decode(result.stdout);
}

function stderr(result: SpawnResult): string {
  return decoder.decode(result.stderr);
}
