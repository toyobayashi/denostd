// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import {
  assert,
  assertEquals,
  assertExists,
  assertNotStrictEquals,
  assertStrictEquals,
} from "../testing/asserts.ts";
import CP from "./child_process.ts";
import { Deferred, deferred } from "../async/deferred.ts";
import { isWindows } from "../_util/os.ts";
import * as path from "../path/mod.ts";
import { Buffer } from "./buffer.ts";
import { ERR_CHILD_PROCESS_STDIO_MAXBUFFER } from "./internal/errors.ts";

const { spawn, execFile, ChildProcess } = CP;

function withTimeout<T>(timeoutInMS: number): Deferred<T> {
  const promise = deferred<T>();
  const timer = setTimeout(() => {
    promise.reject("Timeout");
  }, timeoutInMS);
  promise.then(() => {
    clearTimeout(timer);
  });
  return promise;
}

// TODO(uki00a): Once Node.js's `parallel/test-child-process-spawn-error.js` works, this test case should be removed.
Deno.test("[node/child_process spawn] The 'error' event is emitted when no binary is found", async () => {
  const promise = withTimeout(1000);
  const childProcess = spawn("no-such-cmd");
  childProcess.on("error", (_err: Error) => {
    // TODO Assert an error message.
    promise.resolve();
  });
  await promise;
});

Deno.test("[node/child_process spawn] The 'exit' event is emitted with an exit code after the child process ends", async () => {
  const promise = withTimeout(3000);
  const childProcess = spawn(Deno.execPath(), ["--help"], {
    env: { NO_COLOR: "true" },
  });
  try {
    let exitCode = null;
    childProcess.on("exit", (code: number) => {
      promise.resolve();
      exitCode = code;
    });
    await promise;
    assertStrictEquals(exitCode, 0);
    assertStrictEquals(childProcess.exitCode, exitCode);
  } finally {
    childProcess.kill();
  }
});

Deno.test({
  name: "[node/child_process spawn] Verify that stdin and stdout work",
  fn: async () => {
    const promise = withTimeout(3000);
    const childProcess = spawn(Deno.execPath(), ["fmt", "-"], {
      env: { NO_COLOR: "true" },
      stdio: ["pipe", "pipe"],
    });
    try {
      assert(childProcess.stdin, "stdin should be defined");
      assert(childProcess.stdout, "stdout should be defined");
      let data = "";
      childProcess.stdout.on("data", (chunk) => {
        data += chunk;
      });
      childProcess.stdin.write("  console.log('hello')", "utf-8");
      childProcess.stdin.end();
      childProcess.on("close", () => {
        promise.resolve();
      });
      await promise;
      assertStrictEquals(data, `console.log("hello");\n`);
    } finally {
      childProcess.kill();
    }
  },
});

Deno.test({
  name: "[node/child_process spawn] stdin and stdout with binary data",
  fn: async () => {
    const promise = withTimeout(10000);
    const p = path.join(
      path.dirname(path.fromFileUrl(import.meta.url)),
      "./testdata/binary_stdio.js",
    );
    const childProcess = spawn(Deno.execPath(), ["run", p], {
      env: { NO_COLOR: "true" },
      stdio: ["pipe", "pipe"],
    });
    try {
      assert(childProcess.stdin, "stdin should be defined");
      assert(childProcess.stdout, "stdout should be defined");
      let data: Buffer;
      childProcess.stdout.on("data", (chunk) => {
        data = chunk;
      });
      const buffer = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      childProcess.stdin.write(buffer);
      childProcess.stdin.end();
      childProcess.on("close", () => {
        promise.resolve();
      });
      await promise;
      assertEquals(new Uint8Array(data!), buffer);
    } finally {
      childProcess.kill();
    }
  },
});

async function spawnAndGetEnvValue(
  inputValue: string | number | boolean,
): Promise<string> {
  const promise = withTimeout<string>(3000);
  const env = spawn(
    `"${Deno.execPath()}" eval -p "Deno.env.toObject().BAZ"`,
    {
      env: { BAZ: inputValue, NO_COLOR: "true" },
      shell: true,
    },
  );
  try {
    let envOutput = "";

    assert(env.stdout);
    env.on("error", (err: Error) => promise.reject(err));
    env.stdout.on("data", (data) => {
      envOutput += data;
    });
    env.on("close", () => {
      promise.resolve(envOutput.trim());
    });
    return await promise;
  } finally {
    env.kill();
  }
}

Deno.test({
  ignore: isWindows,
  name:
    "[node/child_process spawn] Verify that environment values can be numbers",
  async fn() {
    const envOutputValue = await spawnAndGetEnvValue(42);
    assertStrictEquals(envOutputValue, "42");
  },
});

Deno.test({
  ignore: isWindows,
  name:
    "[node/child_process spawn] Verify that environment values can be booleans",
  async fn() {
    const envOutputValue = await spawnAndGetEnvValue(false);
    assertStrictEquals(envOutputValue, "false");
  },
});

/* Start of ported part */ 3;
// Copyright Joyent and Node contributors. All rights reserved. MIT license.
// Ported from Node 15.5.1

// TODO(uki00a): Remove this case once Node's `parallel/test-child-process-spawn-event.js` works.
Deno.test("[child_process spawn] 'spawn' event", async () => {
  const timeout = withTimeout(3000);
  const subprocess = spawn("echo", ["ok"]);

  let didSpawn = false;
  subprocess.on("spawn", function () {
    didSpawn = true;
  });

  function mustNotBeCalled() {
    timeout.reject(new Error("function should not have been called"));
  }

  const promises = [] as Promise<void>[];
  function mustBeCalledAfterSpawn() {
    const promise = deferred<void>();
    promises.push(promise);
    return () => {
      if (didSpawn) {
        promise.resolve();
      } else {
        promise.reject(
          new Error("function should be called after the 'spawn' event"),
        );
      }
    };
  }

  subprocess.on("error", mustNotBeCalled);
  subprocess.stdout!.on("data", mustBeCalledAfterSpawn());
  subprocess.stdout!.on("end", mustBeCalledAfterSpawn());
  subprocess.stdout!.on("close", mustBeCalledAfterSpawn());
  subprocess.stderr!.on("data", mustNotBeCalled);
  subprocess.stderr!.on("end", mustBeCalledAfterSpawn());
  subprocess.stderr!.on("close", mustBeCalledAfterSpawn());
  subprocess.on("exit", mustBeCalledAfterSpawn());
  subprocess.on("close", mustBeCalledAfterSpawn());

  try {
    await Promise.race([Promise.all(promises), timeout]);
    timeout.resolve();
  } finally {
    subprocess.kill();
  }
});

// TODO(uki00a): Remove this case once Node's `parallel/test-child-process-spawn-shell.js` works.
Deno.test("[child_process spawn] Verify that a shell is executed", async () => {
  const promise = withTimeout(3000);
  const doesNotExist = spawn("does-not-exist", { shell: true });
  try {
    assertNotStrictEquals(doesNotExist.spawnfile, "does-not-exist");
    doesNotExist.on("error", () => {
      promise.reject("The 'error' event must not be emitted.");
    });
    doesNotExist.on("exit", (code: number, signal: null) => {
      assertStrictEquals(signal, null);

      if (isWindows) {
        assertStrictEquals(code, 1); // Exit code of cmd.exe
      } else {
        assertStrictEquals(code, 127); // Exit code of /bin/sh });
      }

      promise.resolve();
    });
    await promise;
  } finally {
    doesNotExist.kill();
  }
});

// TODO(uki00a): Remove this case once Node's `parallel/test-child-process-spawn-shell.js` works.
Deno.test({
  ignore: isWindows,
  name: "[node/child_process spawn] Verify that passing arguments works",
  async fn() {
    const promise = withTimeout(3000);
    const echo = spawn("echo", ["foo"], {
      shell: true,
    });
    let echoOutput = "";

    try {
      assertStrictEquals(
        echo.spawnargs[echo.spawnargs.length - 1].replace(/"/g, ""),
        "echo foo",
      );
      assert(echo.stdout);
      echo.stdout.on("data", (data) => {
        echoOutput += data;
      });
      echo.on("close", () => {
        assertStrictEquals(echoOutput.trim(), "foo");
        promise.resolve();
      });
      await promise;
    } finally {
      echo.kill();
    }
  },
});

// TODO(uki00a): Remove this case once Node's `parallel/test-child-process-spawn-shell.js` works.
Deno.test({
  ignore: isWindows,
  name: "[node/child_process spawn] Verity that shell features can be used",
  async fn() {
    const promise = withTimeout(3000);
    const cmd = "echo bar | cat";
    const command = spawn(cmd, {
      shell: true,
    });
    try {
      let commandOutput = "";

      assert(command.stdout);
      command.stdout.on("data", (data) => {
        commandOutput += data;
      });

      command.on("close", () => {
        assertStrictEquals(commandOutput.trim(), "bar");
        promise.resolve();
      });

      await promise;
    } finally {
      command.kill();
    }
  },
});

// TODO(uki00a): Remove this case once Node's `parallel/test-child-process-spawn-shell.js` works.
Deno.test({
  ignore: isWindows,
  name:
    "[node/child_process spawn] Verity that environment is properly inherited",
  async fn() {
    const promise = withTimeout(3000);
    const env = spawn(
      `"${Deno.execPath()}" eval -p "Deno.env.toObject().BAZ"`,
      {
        env: { BAZ: "buzz", NO_COLOR: "true" },
        shell: true,
      },
    );
    try {
      let envOutput = "";

      assert(env.stdout);
      env.on("error", (err: Error) => promise.reject(err));
      env.stdout.on("data", (data) => {
        envOutput += data;
      });
      env.on("close", () => {
        assertStrictEquals(envOutput.trim(), "buzz");
        promise.resolve();
      });
      await promise;
    } finally {
      env.kill();
    }
  },
});
/* End of ported part */

Deno.test({
  name: "[node/child_process execFile] Get stdout as a string",
  async fn() {
    let child: unknown;
    const script = path.join(
      path.dirname(path.fromFileUrl(import.meta.url)),
      "./testdata/exec_file_text_output.js",
    );
    const promise = new Promise<string | null>((resolve, reject) => {
      child = execFile(Deno.execPath(), ["run", script], (err, stdout) => {
        if (err) reject(err);
        else if (stdout) resolve(stdout as string);
        else resolve(null);
      });
    });
    try {
      const stdout = await promise;
      assertEquals(stdout, "Hello World!\n");
    } finally {
      if (child instanceof ChildProcess) {
        child.kill();
      }
    }
  },
});

Deno.test({
  name: "[node/child_process execFile] Get stdout as a buffer",
  async fn() {
    let child: unknown;
    const script = path.join(
      path.dirname(path.fromFileUrl(import.meta.url)),
      "./testdata/exec_file_text_output.js",
    );
    const promise = new Promise<Buffer | null>((resolve, reject) => {
      child = execFile(
        Deno.execPath(),
        ["run", script],
        { encoding: "buffer" },
        (err, stdout) => {
          if (err) reject(err);
          else if (stdout) resolve(stdout as Buffer);
          else resolve(null);
        },
      );
    });
    try {
      const stdout = await promise;
      assert(Buffer.isBuffer(stdout));
      assertEquals(stdout.toString("utf8"), "Hello World!\n");
    } finally {
      if (child instanceof ChildProcess) {
        child.kill();
      }
    }
  },
});

Deno.test({
  name: "[node/child_process execFile] Get stderr",
  async fn() {
    let child: unknown;
    const script = path.join(
      path.dirname(path.fromFileUrl(import.meta.url)),
      "./testdata/exec_file_text_error.js",
    );
    const promise = new Promise<
      { err: Error | null; stderr?: string | Buffer }
    >((resolve) => {
      child = execFile(Deno.execPath(), ["run", script], (err, _, stderr) => {
        resolve({ err, stderr });
      });
    });
    try {
      const { err, stderr } = await promise;
      if (child instanceof ChildProcess) {
        assertEquals(child.exitCode, 1);
        assertEquals(stderr, "yikes!\n");
      } else {
        throw err;
      }
    } finally {
      if (child instanceof ChildProcess) {
        child.kill();
      }
    }
  },
});

Deno.test({
  name: "[node/child_process execFile] Exceed given maxBuffer limit",
  async fn() {
    let child: unknown;
    const script = path.join(
      path.dirname(path.fromFileUrl(import.meta.url)),
      "./testdata/exec_file_text_error.js",
    );
    const promise = new Promise<
      { err: Error | null; stderr?: string | Buffer }
    >((resolve) => {
      child = execFile(Deno.execPath(), ["run", script], {
        encoding: "buffer",
        maxBuffer: 3,
      }, (err, _, stderr) => {
        resolve({ err, stderr });
      });
    });
    try {
      const { err, stderr } = await promise;
      if (child instanceof ChildProcess) {
        assert(err);
        assertEquals(
          (err as ERR_CHILD_PROCESS_STDIO_MAXBUFFER).code,
          "ERR_CHILD_PROCESS_STDIO_MAXBUFFER",
        );
        assertEquals(err.message, "stderr maxBuffer length exceeded");
        assertEquals((stderr as Buffer).toString("utf8"), "yik");
      } else {
        throw err;
      }
    } finally {
      if (child instanceof ChildProcess) {
        child.kill();
      }
    }
  },
});

Deno.test({
  name: "[node/child_process] ChildProcess.kill()",
  async fn() {
    const script = path.join(
      path.dirname(path.fromFileUrl(import.meta.url)),
      "./testdata/infinite_loop.js",
    );
    const childProcess = spawn(Deno.execPath(), ["run", script]);
    const p = withTimeout(3000);
    childProcess.on("exit", () => p.resolve());
    childProcess.kill("SIGKILL");
    await p;
    assert(childProcess.killed);
    assertEquals(childProcess.signalCode, "SIGKILL");
    assertExists(childProcess.exitCode);
  },
});
