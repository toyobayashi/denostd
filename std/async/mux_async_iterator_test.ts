// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../testing/asserts.ts";
import { MuxAsyncIterator } from "./mux_async_iterator.ts";

// eslint-disable-next-line require-await
async function* gen123(): AsyncIterableIterator<number> {
  yield 1;
  yield 2;
  yield 3;
}

// eslint-disable-next-line require-await
async function* gen456(): AsyncIterableIterator<number> {
  yield 4;
  yield 5;
  yield 6;
}

Deno.test("[async] MuxAsyncIterator", async function (): Promise<void> {
  const mux = new MuxAsyncIterator<number>();
  mux.add(gen123());
  mux.add(gen456());
  const results = new Set();
  for await (const value of mux) {
    results.add(value);
  }
  assertEquals(results.size, 6);
});
