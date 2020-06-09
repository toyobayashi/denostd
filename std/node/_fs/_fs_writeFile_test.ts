// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
const { test } = Deno;

import {
  assert,
  assertEquals,
  assertNotEquals,
  assertThrows,
} from "../../testing/asserts.ts";
import { writeFile, writeFileSync } from "./_fs_writeFile.ts";
import * as path from "../../path/mod.ts";

const testDataDir = path.resolve(path.join("node", "_fs", "testdata"));
const decoder = new TextDecoder("utf-8");

test("Callback must be a function error", function fn() {
  assertThrows(
    () => {
      writeFile("some/path", "some data", "utf8");
    },
    TypeError,
    "Callback must be a function."
  );
});

test("Invalid encoding results in error()", function testEncodingErrors() {
  assertThrows(
    () => {
      writeFile("some/path", "some data", "made-up-encoding", () => {});
    },
    Error,
    `The value "made-up-encoding" is invalid for option "encoding"`
  );

  assertThrows(
    () => {
      writeFileSync("some/path", "some data", "made-up-encoding");
    },
    Error,
    `The value "made-up-encoding" is invalid for option "encoding"`
  );

  assertThrows(
    () => {
      writeFile(
        "some/path",
        "some data",
        {
          encoding: "made-up-encoding",
        },
        () => {}
      );
    },
    Error,
    `The value "made-up-encoding" is invalid for option "encoding"`
  );

  assertThrows(
    () => {
      writeFileSync("some/path", "some data", {
        encoding: "made-up-encoding",
      });
    },
    Error,
    `The value "made-up-encoding" is invalid for option "encoding"`
  );
});

test("Unsupported encoding results in error()", function testUnsupportedEncoding() {
  assertThrows(
    () => {
      writeFile("some/path", "some data", "hex", () => {});
    },
    Error,
    `Not implemented: "hex" encoding`
  );

  assertThrows(
    () => {
      writeFileSync("some/path", "some data", "hex");
    },
    Error,
    `Not implemented: "hex" encoding`
  );

  assertThrows(
    () => {
      writeFile(
        "some/path",
        "some data",
        {
          encoding: "base64",
        },
        () => {}
      );
    },
    Error,
    `Not implemented: "base64" encoding`
  );

  assertThrows(
    () => {
      writeFileSync("some/path", "some data", {
        encoding: "base64",
      });
    },
    Error,
    `Not implemented: "base64" encoding`
  );
});

test("Data is written to correct rid", async function testCorrectWriteUsingRid() {
  const tempFile: string = await Deno.makeTempFile();
  const file: Deno.File = await Deno.open(tempFile, {
    create: true,
    write: true,
    read: true,
  });

  await new Promise((resolve, reject) => {
    writeFile(file.rid, "hello world", (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
  Deno.close(file.rid);

  const data = await Deno.readFile(tempFile);
  await Deno.remove(tempFile);
  assertEquals(decoder.decode(data), "hello world");
});

test("Data is written to correct file", async function testCorrectWriteUsingPath() {
  const res = await new Promise((resolve) => {
    writeFile("_fs_writeFile_test_file.txt", "hello world", resolve);
  });

  const data = await Deno.readFile("_fs_writeFile_test_file.txt");
  await Deno.remove("_fs_writeFile_test_file.txt");
  assertEquals(res, null);
  assertEquals(decoder.decode(data), "hello world");
});

test("Path can be an URL", async function testCorrectWriteUsingURL() {
  const url = new URL(
    Deno.build.os === "windows"
      ? "file:///" +
        path
          .join(testDataDir, "_fs_writeFile_test_file_url.txt")
          .replace(/\\/g, "/")
      : "file://" + path.join(testDataDir, "_fs_writeFile_test_file_url.txt")
  );
  const filePath = path.fromFileUrl(url);
  const res = await new Promise((resolve) => {
    writeFile(url, "hello world", resolve);
  });
  assert(res === null);

  const data = await Deno.readFile(filePath);
  await Deno.remove(filePath);
  assertEquals(res, null);
  assertEquals(decoder.decode(data), "hello world");
});

test("Mode is correctly set", async function testCorrectFileMode() {
  if (Deno.build.os === "windows") return;
  const filename = "_fs_writeFile_test_file.txt";

  const res = await new Promise((resolve) => {
    writeFile(filename, "hello world", { mode: 0o777 }, resolve);
  });

  const fileInfo = await Deno.stat(filename);
  await Deno.remove(filename);
  assertEquals(res, null);
  assert(fileInfo && fileInfo.mode);
  assertEquals(fileInfo.mode & 0o777, 0o777);
});

test("Mode is not set when rid is passed", async function testCorrectFileModeRid() {
  if (Deno.build.os === "windows") return;

  const filename: string = await Deno.makeTempFile();
  const file: Deno.File = await Deno.open(filename, {
    create: true,
    write: true,
    read: true,
  });

  await new Promise((resolve, reject) => {
    writeFile(file.rid, "hello world", { mode: 0o777 }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
  Deno.close(file.rid);

  const fileInfo = await Deno.stat(filename);
  await Deno.remove(filename);
  assert(fileInfo.mode);
  assertNotEquals(fileInfo.mode & 0o777, 0o777);
});

test("Data is written synchronously to correct rid", function testCorrectWriteSyncUsingRid() {
  const tempFile: string = Deno.makeTempFileSync();
  const file: Deno.File = Deno.openSync(tempFile, {
    create: true,
    write: true,
    read: true,
  });

  writeFileSync(file.rid, "hello world");
  Deno.close(file.rid);

  const data = Deno.readFileSync(tempFile);
  Deno.removeSync(tempFile);
  assertEquals(decoder.decode(data), "hello world");
});

test("Data is written synchronously to correct file", function testCorrectWriteSyncUsingPath() {
  const file = "_fs_writeFileSync_test_file";

  writeFileSync(file, "hello world");

  const data = Deno.readFileSync(file);
  Deno.removeSync(file);
  assertEquals(decoder.decode(data), "hello world");
});

test("sync: Path can be an URL", function testCorrectWriteSyncUsingURL() {
  const filePath = path.join(
    testDataDir,
    "_fs_writeFileSync_test_file_url.txt"
  );
  const url = new URL(
    Deno.build.os === "windows"
      ? "file:///" + filePath.replace(/\\/g, "/")
      : "file://" + filePath
  );
  writeFileSync(url, "hello world");

  const data = Deno.readFileSync(filePath);
  Deno.removeSync(filePath);
  assertEquals(decoder.decode(data), "hello world");
});

test("Mode is correctly set when writing synchronously", function testCorrectFileModeSync() {
  if (Deno.build.os === "windows") return;
  const filename = "_fs_writeFileSync_test_file.txt";

  writeFileSync(filename, "hello world", { mode: 0o777 });

  const fileInfo = Deno.statSync(filename);
  Deno.removeSync(filename);
  assert(fileInfo && fileInfo.mode);
  assertEquals(fileInfo.mode & 0o777, 0o777);
});
