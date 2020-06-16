// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { assertStrictEquals } from "../../testing/asserts.ts";

Deno.test("[examples/cat] print multiple files", async () => {
  const decoder = new TextDecoder();
  const process = Deno.run({
    cmd: [
      Deno.execPath(),
      "run",
      "--allow-read",
      "cat.ts",
      "testdata/cat/hello.txt",
      "testdata/cat/world.txt",
    ],
    cwd: "examples",
    stdout: "piped",
  });

  try {
    const output = await process.output();
    const actual = decoder.decode(output).trim();
    assertStrictEquals(actual, "Hello\nWorld");
  } finally {
    process.close();
  }
});
