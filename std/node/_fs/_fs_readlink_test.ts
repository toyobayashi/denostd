const { test } = Deno;
import { readlink, readlinkSync } from "./_fs_readlink.ts";
import { assertEquals, assert } from "../../testing/asserts.ts";
import * as path from "../path.ts";

const testDir = Deno.makeTempDirSync();
const oldname = path.join(testDir, "oldname");
const newname = path.join(testDir, "newname");

if (Deno.build.os === "windows") {
  Deno.symlinkSync(oldname, newname, { type: "file" });
} else {
  Deno.symlinkSync(oldname, newname);
}

test({
  name: "readlinkSuccess",
  async fn() {
    const data = await new Promise((res, rej) => {
      readlink(newname, (err, data) => {
        if (err) {
          rej(err);
        }
        res(data);
      });
    });

    assertEquals(typeof data, "string");
    assertEquals(data as string, oldname);
  },
});

test({
  name: "readlinkEncodeBufferSuccess",
  async fn() {
    const data = await new Promise((res, rej) => {
      readlink(newname, { encoding: "buffer" }, (err, data) => {
        if (err) {
          rej(err);
        }
        res(data);
      });
    });

    assert(data instanceof Uint8Array);
    assertEquals(new TextDecoder().decode(data as Uint8Array), oldname);
  },
});

test({
  name: "readlinkSyncSuccess",
  fn() {
    const data = readlinkSync(newname);
    assertEquals(typeof data, "string");
    assertEquals(data as string, oldname);
  },
});

test({
  name: "readlinkEncodeBufferSuccess",
  fn() {
    const data = readlinkSync(newname, { encoding: "buffer" });
    assert(data instanceof Uint8Array);
    assertEquals(new TextDecoder().decode(data as Uint8Array), oldname);
  },
});
