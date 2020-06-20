// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { assert, assertEquals } from "../testing/asserts.ts";
import {
  getLogger,
  debug,
  info,
  warning,
  error,
  critical,
  setup,
} from "./mod.ts";
import { Logger } from "./logger.ts";
import { BaseHandler } from "./handlers.ts";

class TestHandler extends BaseHandler {
  public messages: string[] = [];

  public log(str: string): void {
    this.messages.push(str);
  }
}

let logger: Logger | null = null;
try {
  // Need to initialize it here
  // otherwise it will be already initialized on Deno.test
  logger = getLogger();
} catch {
  // Pass
}

Deno.test("logger is initialized", function (): void {
  assert(logger instanceof Logger);
});

Deno.test("default loggers work as expected", function (): void {
  const sym = Symbol("a");
  const debugData: string = debug("foo");
  const debugResolver: string | undefined = debug(() => "foo");
  const infoData: number = info(456, 1, 2, 3);
  const infoResolver: boolean | undefined = info(() => true);
  const warningData: symbol = warning(sym);
  const warningResolver: null | undefined = warning(() => null);
  const errorData: undefined = error(undefined, 1, 2, 3);
  const errorResolver: bigint | undefined = error(() => 5n);
  const criticalData: string = critical("foo");
  const criticalResolver: string | undefined = critical(() => "bar");
  assertEquals(debugData, "foo");
  assertEquals(debugResolver, undefined);
  assertEquals(infoData, 456);
  assertEquals(infoResolver, true);
  assertEquals(warningData, sym);
  assertEquals(warningResolver, null);
  assertEquals(errorData, undefined);
  assertEquals(errorResolver, 5n);
  assertEquals(criticalData, "foo");
  assertEquals(criticalResolver, "bar");
});

Deno.test({
  name: "Logging config works as expected with logger names",
  async fn() {
    const consoleHandler = new TestHandler("DEBUG");
    const anotherConsoleHandler = new TestHandler("DEBUG", {
      formatter: "[{loggerName}] {levelName} {msg}",
    });
    await setup({
      handlers: {
        console: consoleHandler,
        anotherConsole: anotherConsoleHandler,
      },

      loggers: {
        // configure default logger available via short-hand methods above
        default: {
          level: "DEBUG",
          handlers: ["console"],
        },

        tasks: {
          level: "ERROR",
          handlers: ["anotherConsole"],
        },
      },
    });
    getLogger().debug("hello");
    getLogger("tasks").error("world");
    assertEquals(consoleHandler.messages[0], "DEBUG hello");
    assertEquals(anotherConsoleHandler.messages[0], "[tasks] ERROR world");
  },
});
