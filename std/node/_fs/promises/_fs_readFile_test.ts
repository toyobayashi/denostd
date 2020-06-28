import { readFile } from "./_fs_readFile.ts";
import * as path from "../../../path/mod.ts";
import { assertEquals, assert } from "../../../testing/asserts.ts";

const testData = path.resolve(
  path.join("node", "_fs", "testdata", "hello.txt")
);

Deno.test("readFileSuccess", async function () {
  const data: Uint8Array = await readFile(testData);

  assert(data instanceof Uint8Array);
  assertEquals(new TextDecoder().decode(data), "hello world");
});

Deno.test("readFileBinarySuccess", async function () {
  const data: Uint8Array = await readFile(testData, "binary");

  assert(data instanceof Uint8Array);
  assertEquals(new TextDecoder().decode(data), "hello world");
});

Deno.test("readFileBinaryObjectSuccess", async function () {
  const data: Uint8Array = await readFile(testData, { encoding: "binary" });

  assert(data instanceof Uint8Array);
  assertEquals(new TextDecoder().decode(data), "hello world");
});

Deno.test("readFileStringObjectSuccess", async function () {
  const data: string = await readFile(testData, { encoding: "utf8" });

  assertEquals(typeof data, "string");
  assertEquals(data, "hello world");
});

Deno.test("readFileStringSuccess", async function () {
  const data: string = await readFile(testData, "utf8");

  assertEquals(typeof data, "string");
  assertEquals(data, "hello world");
});

Deno.test("readFileError", async function () {
  try {
    await readFile("invalid-file", "utf8");
  } catch (e) {
    assert(e instanceof Deno.errors.NotFound);
  }
});
