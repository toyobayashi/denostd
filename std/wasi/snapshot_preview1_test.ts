/* eslint-disable */

import { assert, assertEquals } from "../testing/asserts.ts";
import { copy } from "../fs/mod.ts";
import * as path from "../path/mod.ts";

const ignore = [
  "wasi_clock_time_get_realtime.wasm",
];

// TODO(caspervonb) investigate why these tests are failing on windows and fix
// them.
if (Deno.build.os == "windows") {
  ignore.push("std_fs_metadata_absolute.wasm");
  ignore.push("std_fs_metadata_relative.wasm");
  ignore.push("std_fs_read_dir_absolute.wasm");
  ignore.push("std_fs_read_dir_relative.wasm");
}

const rootdir = path.dirname(path.fromFileUrl(import.meta.url));
const testdir = path.join(rootdir, "testdata");

for await (const entry of Deno.readDir(testdir)) {
  if (!entry.name.endsWith(".wasm")) {
    continue;
  }

  Deno.test({
    name: entry.name,
    ignore: ignore.includes(entry.name),
    fn: async function () {
      const basename = entry.name.replace(/\.wasm$/, ".json");
      const prelude = await Deno.readTextFile(
        path.resolve(testdir, basename),
      );
      const options = JSON.parse(prelude);

      const workdir = await Deno.makeTempDir();
      await copy(
        path.join(testdir, "fixtures"),
        path.join(workdir, "fixtures"),
      );

      try {
        const process = await Deno.run({
          cwd: workdir,
          cmd: [
            `${Deno.execPath()}`,
            "run",
            "--quiet",
            "--unstable",
            "--allow-all",
            path.resolve(rootdir, "snapshot_preview1_test_runner.ts"),
            prelude,
            path.resolve(testdir, entry.name),
          ],
          stdin: "piped",
          stdout: "piped",
          stderr: "piped",
        });

        if (options.stdin) {
          const stdin = new TextEncoder().encode(options.stdin);
          await Deno.writeAll(process.stdin, stdin);
        }

        process.stdin.close();

        const stdout = await Deno.readAll(process.stdout);

        if (options.stdout) {
          assertEquals(new TextDecoder().decode(stdout), options.stdout);
        } else {
          await Deno.writeAll(Deno.stdout, stdout);
        }

        process.stdout.close();

        const stderr = await Deno.readAll(process.stderr);

        if (options.stderr) {
          assertEquals(new TextDecoder().decode(stderr), options.stderr);
        } else {
          await Deno.writeAll(Deno.stderr, stderr);
        }

        process.stderr.close();

        const status = await process.status();
        assertEquals(status.code, options.exitCode ? +options.exitCode : 0);

        process.close();
      } catch (err) {
        throw err;
      } finally {
        await Deno.remove(workdir, { recursive: true });
      }
    },
  });
}
