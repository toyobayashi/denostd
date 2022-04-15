// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
/** This module is browser compatible. */

import {
  assertEquals,
  AssertionError,
  assertIsError,
  assertRejects,
} from "./asserts.ts";

/** An error related to spying on a function or instance method. */
export class MockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MockError";
  }
}

/** Call information recorded by a spy. */
export interface SpyCall<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  // deno-lint-ignore no-explicit-any
  Return = any,
> {
  /** Arguments passed to a function when called. */
  args: Args;
  /** The value that was returned by a function. */
  returned?: Return;
  /** The error value that was thrown by a function. */
  error?: Error;
  /** The instance that a method was called on. */
  self?: Self;
}

/** A function or instance method wrapper that records all calls made to it. */
export interface Spy<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  // deno-lint-ignore no-explicit-any
  Return = any,
> {
  (this: Self, ...args: Args): Return;
  /** The function that is being spied on. */
  original: (this: Self, ...args: Args) => Return;
  /** Information about calls made to the function or instance method. */
  calls: SpyCall<Self, Args, Return>[];
  /** Whether or not the original instance method has been restored. */
  restored: boolean;
  /** If spying on an instance method, this restores the original instance method. */
  restore(): void;
}

/** Wraps a function with a Spy. */
function functionSpy<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  Return = undefined,
>(): Spy<Self, Args, Return>;
function functionSpy<
  Self,
  Args extends unknown[],
  Return,
>(func: (this: Self, ...args: Args) => Return): Spy<Self, Args, Return>;
function functionSpy<
  Self,
  Args extends unknown[],
  Return,
>(func?: (this: Self, ...args: Args) => Return): Spy<Self, Args, Return> {
  const original = func ?? (() => {}) as (this: Self, ...args: Args) => Return,
    calls: SpyCall<Self, Args, Return>[] = [];
  const spy = function (this: Self, ...args: Args): Return {
    const call: SpyCall<Self, Args, Return> = { args };
    if (this) call.self = this;
    try {
      call.returned = original.apply(this, args);
    } catch (error) {
      call.error = error as Error;
      calls.push(call);
      throw error;
    }
    calls.push(call);
    return call.returned;
  } as Spy<Self, Args, Return>;
  Object.defineProperties(spy, {
    original: {
      enumerable: true,
      value: original,
    },
    calls: {
      enumerable: true,
      value: calls,
    },
    restored: {
      enumerable: true,
      get: () => false,
    },
    restore: {
      enumerable: true,
      value: () => {
        throw new MockError("function cannot be restored");
      },
    },
  });
  return spy;
}

/** Checks if a function is a spy. */
function isSpy<Self, Args extends unknown[], Return>(
  func: ((this: Self, ...args: Args) => Return) | unknown,
): func is Spy<Self, Args, Return> {
  const spy = func as Spy<Self, Args, Return>;
  return typeof spy === "function" &&
    typeof spy.original === "function" &&
    typeof spy.restored === "boolean" &&
    typeof spy.restore === "function" &&
    Array.isArray(spy.calls);
}

// deno-lint-ignore no-explicit-any
const sessions: Set<Spy<any, any[], any>>[] = [];
// deno-lint-ignore no-explicit-any
function getSession(): Set<Spy<any, any[], any>> {
  if (sessions.length === 0) sessions.push(new Set());
  return sessions[sessions.length - 1];
}
// deno-lint-ignore no-explicit-any
function registerMock(spy: Spy<any, any[], any>): void {
  const session = getSession();
  session.add(spy);
}
// deno-lint-ignore no-explicit-any
function unregisterMock(spy: Spy<any, any[], any>): void {
  const session = getSession();
  session.delete(spy);
}

/**
 * Creates a session that tracks all mocks created before it's restored.
 * If a callback is provided, it restores all mocks created within it.
 */
export function mockSession(): number;
export function mockSession<
  Self,
  Args extends unknown[],
  Return,
>(
  func: (this: Self, ...args: Args) => Return,
): (this: Self, ...args: Args) => Return;
export function mockSession<
  Self,
  Args extends unknown[],
  Return,
>(
  func?: (this: Self, ...args: Args) => Return,
): number | ((this: Self, ...args: Args) => Return) {
  if (func) {
    return function (this: Self, ...args: Args): Return {
      const id = sessions.length;
      sessions.push(new Set());
      try {
        return func.apply(this, args);
      } finally {
        restore(id);
      }
    };
  } else {
    sessions.push(new Set());
    return sessions.length - 1;
  }
}

/** Creates an async session that tracks all mocks created before the promise resolves. */
export function mockSessionAsync<
  Self,
  Args extends unknown[],
  Return,
>(
  func: (this: Self, ...args: Args) => Promise<Return>,
): (this: Self, ...args: Args) => Promise<Return> {
  return async function (this: Self, ...args: Args): Promise<Return> {
    const id = sessions.length;
    sessions.push(new Set());
    try {
      return await func.apply(this, args);
    } finally {
      restore(id);
    }
  };
}

/**
 * Restores all mocks registered in the current session that have not already been restored.
 * If an id is provided, it will restore all mocks registered in the session associed with that id that have not already been restored.
 */
export function restore(id?: number): void {
  id ??= (sessions.length || 1) - 1;
  while (id < sessions.length) {
    const session = sessions.pop();
    if (session) {
      for (const value of session) {
        value.restore();
      }
    }
  }
}

/** Wraps an instance method with a Spy. */
function methodSpy<
  Self,
  Args extends unknown[],
  Return,
>(self: Self, property: keyof Self): Spy<Self, Args, Return> {
  if (typeof self[property] !== "function") {
    throw new MockError("property is not an instance method");
  }
  if (isSpy(self[property])) {
    throw new MockError("already spying on instance method");
  }

  const propertyDescriptor = Object.getOwnPropertyDescriptor(self, property);
  if (propertyDescriptor && !propertyDescriptor.configurable) {
    throw new MockError("cannot spy on non configurable instance method");
  }

  const original = self[property] as unknown as (
      this: Self,
      ...args: Args
    ) => Return,
    calls: SpyCall<Self, Args, Return>[] = [];
  let restored = false;
  const spy = function (this: Self, ...args: Args): Return {
    const call: SpyCall<Self, Args, Return> = { args };
    if (this) call.self = this;
    try {
      call.returned = original.apply(this, args);
    } catch (error) {
      call.error = error as Error;
      calls.push(call);
      throw error;
    }
    calls.push(call);
    return call.returned;
  } as Spy<Self, Args, Return>;
  Object.defineProperties(spy, {
    original: {
      enumerable: true,
      value: original,
    },
    calls: {
      enumerable: true,
      value: calls,
    },
    restored: {
      enumerable: true,
      get: () => restored,
    },
    restore: {
      enumerable: true,
      value: () => {
        if (restored) {
          throw new MockError("instance method already restored");
        }
        if (propertyDescriptor) {
          Object.defineProperty(self, property, propertyDescriptor);
        } else {
          delete self[property];
        }
        restored = true;
        unregisterMock(spy);
      },
    },
  });

  Object.defineProperty(self, property, {
    configurable: true,
    enumerable: propertyDescriptor?.enumerable,
    writable: propertyDescriptor?.writable,
    value: spy,
  });

  registerMock(spy);
  return spy;
}

/** Wraps a function or instance method with a Spy. */
export function spy<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  Return = undefined,
>(): Spy<Self, Args, Return>;
export function spy<
  Self,
  Args extends unknown[],
  Return,
>(func: (this: Self, ...args: Args) => Return): Spy<Self, Args, Return>;
export function spy<
  Self,
  Args extends unknown[],
  Return,
>(self: Self, property: keyof Self): Spy<Self, Args, Return>;
export function spy<
  Self,
  Args extends unknown[],
  Return,
>(
  funcOrSelf?: ((this: Self, ...args: Args) => Return) | Self,
  property?: keyof Self,
): Spy<Self, Args, Return> {
  const spy = typeof property !== "undefined"
    ? methodSpy<Self, Args, Return>(funcOrSelf as Self, property)
    : typeof funcOrSelf === "function"
    ? functionSpy<Self, Args, Return>(
      funcOrSelf as (this: Self, ...args: Args) => Return,
    )
    : functionSpy<Self, Args, Return>();
  return spy;
}

/** An instance method replacement that records all calls made to it. */
export interface Stub<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  // deno-lint-ignore no-explicit-any
  Return = any,
> extends Spy<Self, Args, Return> {
  /** The function that is used instead of the original. */
  fake: (this: Self, ...args: Args) => Return;
}

/** Replaces an instance method with a Stub. */
export function stub<
  Self,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  Return = undefined,
>(self: Self, property: keyof Self): Stub<Self, Args, Return>;
export function stub<
  Self,
  Args extends unknown[],
  Return,
>(
  self: Self,
  property: keyof Self,
  func: (this: Self, ...args: Args) => Return,
): Stub<Self, Args, Return>;
export function stub<
  Self,
  Args extends unknown[],
  Return,
>(
  self: Self,
  property: keyof Self,
  func?: (this: Self, ...args: Args) => Return,
): Stub<Self, Args, Return> {
  if (typeof self[property] !== "function") {
    throw new MockError("property is not an instance method");
  }
  if (isSpy(self[property])) {
    throw new MockError("already spying on instance method");
  }

  const propertyDescriptor = Object.getOwnPropertyDescriptor(self, property);
  if (propertyDescriptor && !propertyDescriptor.configurable) {
    throw new MockError("cannot spy on non configurable instance method");
  }

  const fake = func ?? (() => {}) as (this: Self, ...args: Args) => Return;

  const original = self[property] as unknown as (
      this: Self,
      ...args: Args
    ) => Return,
    calls: SpyCall<Self, Args, Return>[] = [];
  let restored = false;
  const stub = function (this: Self, ...args: Args): Return {
    const call: SpyCall<Self, Args, Return> = { args };
    if (this) call.self = this;
    try {
      call.returned = fake.apply(this, args);
    } catch (error) {
      call.error = error as Error;
      calls.push(call);
      throw error;
    }
    calls.push(call);
    return call.returned;
  } as Stub<Self, Args, Return>;
  Object.defineProperties(stub, {
    original: {
      enumerable: true,
      value: original,
    },
    fake: {
      enumerable: true,
      value: fake,
    },
    calls: {
      enumerable: true,
      value: calls,
    },
    restored: {
      enumerable: true,
      get: () => restored,
    },
    restore: {
      enumerable: true,
      value: () => {
        if (restored) {
          throw new MockError("instance method already restored");
        }
        if (propertyDescriptor) {
          Object.defineProperty(self, property, propertyDescriptor);
        } else {
          delete self[property];
        }
        restored = true;
        unregisterMock(stub);
      },
    },
  });

  Object.defineProperty(self, property, {
    configurable: true,
    enumerable: propertyDescriptor?.enumerable,
    writable: propertyDescriptor?.writable,
    value: stub,
  });

  registerMock(stub);
  return stub;
}

/**
 * Asserts that a spy is called as much as expected and no more.
 */
export function assertSpyCalls<
  Self,
  Args extends unknown[],
  Return,
>(
  spy: Spy<Self, Args, Return>,
  expectedCalls: number,
) {
  try {
    assertEquals(spy.calls.length, expectedCalls);
  } catch (e) {
    assertIsError(e);
    let message = spy.calls.length < expectedCalls
      ? "spy not called as much as expected:\n"
      : "spy called more than expected:\n";
    message += e.message.split("\n").slice(1).join("\n");
    throw new AssertionError(message);
  }
}

/** Call information recorded by a spy. */
export interface ExpectedSpyCall<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  // deno-lint-ignore no-explicit-any
  Return = any,
> {
  /** Arguments passed to a function when called. */
  args?: [...Args, ...unknown[]];
  /** The instance that a method was called on. */
  self?: Self;
  /**
   * The value that was returned by a function.
   * If you expect a promise to reject, expect error instead.
   */
  returned?: Return;
  error?: {
    /** The class for the error that was thrown by a function. */
    // deno-lint-ignore no-explicit-any
    Class?: new (...args: any[]) => Error;
    /** Part of the message for the error that was thrown by a function. */
    msgIncludes?: string;
  };
}

/**
 * Asserts that a spy is called as expected.
 */
export function assertSpyCall<
  Self,
  Args extends unknown[],
  Return,
>(
  spy: Spy<Self, Args, Return>,
  callIndex: number,
  expected?: ExpectedSpyCall<Self, Args, Return>,
) {
  if (spy.calls.length < (callIndex + 1)) {
    throw new AssertionError("spy not called as much as expected");
  }
  const call: SpyCall = spy.calls[callIndex];
  if (expected) {
    if (expected.args) {
      try {
        assertEquals(call.args, expected.args);
      } catch (e) {
        assertIsError(e);
        throw new AssertionError(
          "spy not called with expected args:\n" +
            e.message.split("\n").slice(1).join("\n"),
        );
      }
    }

    if ("self" in expected) {
      try {
        assertEquals(call.self, expected.self);
      } catch (e) {
        assertIsError(e);
        let message = expected.self
          ? "spy not called as method on expected self:\n"
          : "spy not expected to be called as method on object:\n";
        message += e.message.split("\n").slice(1).join("\n");
        throw new AssertionError(message);
      }
    }

    if ("returned" in expected) {
      if ("error" in expected) {
        throw new TypeError(
          "do not expect error and return, only one should be expected",
        );
      }
      if (call.error) {
        throw new AssertionError(
          "spy call did not return expected value, an error was thrown.",
        );
      }
      try {
        assertEquals(call.returned, expected.returned);
      } catch (e) {
        assertIsError(e);
        throw new AssertionError(
          "spy call did not return expected value:\n" +
            e.message.split("\n").slice(1).join("\n"),
        );
      }
    }

    if ("error" in expected) {
      if ("returned" in call) {
        throw new AssertionError(
          "spy call did not throw an error, a value was returned.",
        );
      }
      assertIsError(
        call.error,
        expected.error?.Class,
        expected.error?.msgIncludes,
      );
    }
  }
}

/**
 * Asserts that an async spy is called as expected.
 */
export async function assertSpyCallAsync<
  Self,
  Args extends unknown[],
  Return,
>(
  spy: Spy<Self, Args, Promise<Return>>,
  callIndex: number,
  expected?: ExpectedSpyCall<Self, Args, Promise<Return> | Return>,
) {
  const expectedSync = expected && { ...expected };
  if (expectedSync) {
    delete expectedSync.returned;
    delete expectedSync.error;
  }
  assertSpyCall(spy, callIndex, expectedSync);
  const call = spy.calls[callIndex];

  if (call.error) {
    throw new AssertionError(
      "spy call did not return a promise, an error was thrown.",
    );
  }
  if (call.returned !== Promise.resolve(call.returned)) {
    throw new AssertionError(
      "spy call did not return a promise, a value was returned.",
    );
  }

  if (expected) {
    if ("returned" in expected) {
      if ("error" in expected) {
        throw new TypeError(
          "do not expect error and return, only one should be expected",
        );
      }
      if (call.error) {
        throw new AssertionError(
          "spy call did not return expected value, an error was thrown.",
        );
      }
      let expectedResolved;
      try {
        expectedResolved = await expected.returned;
      } catch {
        throw new TypeError(
          "do not expect rejected promise, expect error instead",
        );
      }

      let resolved;
      try {
        resolved = await call.returned;
      } catch {
        throw new AssertionError("spy call returned promise was rejected");
      }

      try {
        assertEquals(resolved, expectedResolved);
      } catch (e) {
        assertIsError(e);
        throw new AssertionError(
          "spy call did not resolve to expected value:\n" +
            e.message.split("\n").slice(1).join("\n"),
        );
      }
    }

    if ("error" in expected) {
      await assertRejects(
        () => Promise.resolve(call.returned),
        expected.error?.Class ?? Error,
        expected.error?.msgIncludes ?? "",
      );
    }
  }
}

/**
 * Asserts that a spy is called with a specific arg as expected.
 */
export function assertSpyCallArg<
  Self,
  Args extends unknown[],
  Return,
  ExpectedArg,
>(
  spy: Spy<Self, Args, Return>,
  callIndex: number,
  argIndex: number,
  expected: ExpectedArg,
): ExpectedArg {
  assertSpyCall(spy, callIndex);
  const call = spy.calls[callIndex];
  const arg = call.args[argIndex];
  assertEquals(arg, expected);
  return arg as ExpectedArg;
}

/**
 * Asserts that an spy is called with a specific range of args as expected.
 * If a start and end index is not provided, the expected will be compared against all args.
 * If a start is provided without an end index, the expected will be compared against all args from the start index to the end.
 * The end index is not included in the range of args that are compared.
 */
export function assertSpyCallArgs<
  Self,
  Args extends unknown[],
  Return,
  ExpectedArgs extends unknown[],
>(
  spy: Spy<Self, Args, Return>,
  callIndex: number,
  expected: ExpectedArgs,
): ExpectedArgs;
export function assertSpyCallArgs<
  Self,
  Args extends unknown[],
  Return,
  ExpectedArgs extends unknown[],
>(
  spy: Spy<Self, Args, Return>,
  callIndex: number,
  argsStart: number,
  expected: ExpectedArgs,
): ExpectedArgs;
export function assertSpyCallArgs<
  Self,
  Args extends unknown[],
  Return,
  ExpectedArgs extends unknown[],
>(
  spy: Spy<Self, Args, Return>,
  callIndex: number,
  argStart: number,
  argEnd: number,
  expected: ExpectedArgs,
): ExpectedArgs;
export function assertSpyCallArgs<
  ExpectedArgs extends unknown[],
  Args extends unknown[],
  Return,
  Self,
>(
  spy: Spy<Self, Args, Return>,
  callIndex: number,
  argsStart?: number | ExpectedArgs,
  argsEnd?: number | ExpectedArgs,
  expected?: ExpectedArgs,
): ExpectedArgs {
  assertSpyCall(spy, callIndex);
  const call = spy.calls[callIndex];
  if (!expected) {
    expected = argsEnd as ExpectedArgs;
    argsEnd = undefined;
  }
  if (!expected) {
    expected = argsStart as ExpectedArgs;
    argsStart = undefined;
  }
  const args = typeof argsEnd === "number"
    ? call.args.slice(argsStart as number, argsEnd)
    : typeof argsStart === "number"
    ? call.args.slice(argsStart)
    : call.args;
  assertEquals(args, expected);
  return args as ExpectedArgs;
}

/** Creates a function that returns the instance the method was called on. */
export function returnsThis<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
>(): (this: Self, ...args: Args) => Self {
  return function (this: Self): Self {
    return this;
  };
}

/** Creates a function that returns one of its arguments. */
// deno-lint-ignore no-explicit-any
export function returnsArg<Arg, Self = any>(
  idx: number,
): (this: Self, ...args: Arg[]) => Arg {
  return function (...args: Arg[]): Arg {
    return args[idx];
  };
}

/** Creates a function that returns its arguments or a subset of them. If end is specified, it will return arguments up to but not including the end. */
export function returnsArgs<
  Args extends unknown[],
  // deno-lint-ignore no-explicit-any
  Self = any,
>(
  start = 0,
  end?: number,
): (this: Self, ...args: Args) => Args {
  return function (this: Self, ...args: Args): Args {
    return args.slice(start, end) as Args;
  };
}

/** Creates a function that returns the iterable values. Any iterable values that are errors will be thrown. */
export function returnsNext<
  Return,
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
>(
  values: Iterable<Return | Error>,
): (this: Self, ...args: Args) => Return {
  const gen = (function* returnsValue() {
    yield* values;
  })();
  let calls = 0;
  return function () {
    const next = gen.next();
    if (next.done) {
      throw new MockError(`not expected to be called more than ${calls} times`);
    }
    calls++;
    const { value } = next;
    if (value instanceof Error) throw value;
    return value;
  };
}

/** Creates a function that resolves the awaited iterable values. Any awaited iterable values that are errors will be thrown. */
export function resolvesNext<
  Return,
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
>(
  iterable:
    | Iterable<Return | Error | Promise<Return | Error>>
    | AsyncIterable<Return | Error | Promise<Return | Error>>,
): (this: Self, ...args: Args) => Promise<Return> {
  const gen = (async function* returnsValue() {
    yield* iterable;
  })();
  let calls = 0;
  return async function () {
    const next = await gen.next();
    if (next.done) {
      throw new MockError(`not expected to be called more than ${calls} times`);
    }
    calls++;
    const { value } = next;
    if (value instanceof Error) throw value;
    return value;
  };
}
