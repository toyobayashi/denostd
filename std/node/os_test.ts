const { test } = Deno;
import { assert, assertThrows, assertEquals } from "../testing/asserts.ts";
import * as os from "./os.ts";

test({
  name: "build architecture is a string",
  fn() {
    assertEquals(typeof os.arch(), "string");
  },
});

test({
  name: "home directory is a string",
  fn() {
    assertEquals(typeof os.homedir(), "string");
  },
});

test({
  name: "tmp directory is a string",
  fn() {
    assertEquals(typeof os.tmpdir(), "string");
  },
});

test({
  name: "hostname is a string",
  fn() {
    assertEquals(typeof os.hostname(), "string");
  },
});

test({
  name: "platform is a string",
  fn() {
    assertEquals(typeof os.platform(), "string");
  },
});

test({
  name: "release is a string",
  fn() {
    assertEquals(typeof os.release(), "string");
  },
});

test({
  name: "getPriority(): PID must be a 32 bit integer",
  fn() {
    assertThrows(
      () => {
        os.getPriority(3.15);
      },
      Error,
      "pid must be 'an integer'"
    );
    assertThrows(
      () => {
        os.getPriority(9999999999);
      },
      Error,
      "must be >= -2147483648 && <= 2147483647"
    );
  },
});

test({
  name: "setPriority(): PID must be a 32 bit integer",
  fn() {
    assertThrows(
      () => {
        os.setPriority(3.15, 0);
      },
      Error,
      "pid must be 'an integer'"
    );
    assertThrows(
      () => {
        os.setPriority(9999999999, 0);
      },
      Error,
      "pid must be >= -2147483648 && <= 2147483647"
    );
  },
});

test({
  name: "setPriority(): priority must be an integer between -20 and 19",
  fn() {
    assertThrows(
      () => {
        os.setPriority(0, 3.15);
      },
      Error,
      "priority must be 'an integer'"
    );
    assertThrows(
      () => {
        os.setPriority(0, -21);
      },
      Error,
      "priority must be >= -20 && <= 19"
    );
    assertThrows(
      () => {
        os.setPriority(0, 20);
      },
      Error,
      "priority must be >= -20 && <= 19"
    );
    assertThrows(
      () => {
        os.setPriority(0, 9999999999);
      },
      Error,
      "priority must be >= -20 && <= 19"
    );
  },
});

test({
  name:
    "setPriority(): if only one argument specified, then this is the priority, NOT the pid",
  fn() {
    assertThrows(
      () => {
        os.setPriority(3.15);
      },
      Error,
      "priority must be 'an integer'"
    );
    assertThrows(
      () => {
        os.setPriority(-21);
      },
      Error,
      "priority must be >= -20 && <= 19"
    );
    assertThrows(
      () => {
        os.setPriority(20);
      },
      Error,
      "priority must be >= -20 && <= 19"
    );
    assertThrows(
      () => {
        os.setPriority(9999999999);
      },
      Error,
      "priority must be >= -20 && <= 19"
    );
  },
});

test({
  name: "Signals are as expected",
  fn() {
    // Test a few random signals for equality
    assertEquals(os.constants.signals.SIGKILL, Deno.Signal.SIGKILL);
    assertEquals(os.constants.signals.SIGCONT, Deno.Signal.SIGCONT);
    assertEquals(os.constants.signals.SIGXFSZ, Deno.Signal.SIGXFSZ);
  },
});

test({
  name: "EOL is as expected",
  fn() {
    assert(os.EOL == "\r\n" || os.EOL == "\n");
  },
});

test({
  name: "Endianness is determined",
  fn() {
    assert(["LE", "BE"].includes(os.endianness()));
  },
});

test({
  name: "Load average is an array of 3 numbers",
  fn() {
    const result = os.loadavg();
    assert(result.length == 3);
    assertEquals(typeof result[0], "number");
    assertEquals(typeof result[1], "number");
    assertEquals(typeof result[2], "number");
  },
});

test({
  name: "Primitive coercion works as expected",
  fn() {
    assertEquals(`${os.arch}`, os.arch());
    assertEquals(`${os.endianness}`, os.endianness());
    assertEquals(`${os.homedir}`, os.homedir());
    assertEquals(`${os.hostname}`, os.hostname());
    assertEquals(`${os.platform}`, os.platform());
  },
});

test({
  name: "APIs not yet implemented",
  fn() {
    assertThrows(
      () => {
        os.cpus();
      },
      Error,
      "Not implemented"
    );
    assertThrows(
      () => {
        os.freemem();
      },
      Error,
      "Not implemented"
    );
    assertThrows(
      () => {
        os.getPriority();
      },
      Error,
      "Not implemented"
    );
    assertThrows(
      () => {
        os.networkInterfaces();
      },
      Error,
      "Not implemented"
    );
    assertThrows(
      () => {
        os.setPriority(0);
      },
      Error,
      "Not implemented"
    );
    assertThrows(
      () => {
        os.totalmem();
      },
      Error,
      "Not implemented"
    );
    assertThrows(
      () => {
        os.type();
      },
      Error,
      "Not implemented"
    );
    assertThrows(
      () => {
        os.uptime();
      },
      Error,
      "Not implemented"
    );
    assertThrows(
      () => {
        os.userInfo();
      },
      Error,
      "Not implemented"
    );
  },
});
