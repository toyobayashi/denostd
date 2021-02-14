// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
import { delay } from "./delay.ts";
import { assert } from "../testing/asserts.ts";

Deno.test("[async] delay", async function (): Promise<void> {
  const start = new Date();
  const delayedPromise = delay(100);
  const result = await delayedPromise;
  const diff = new Date().getTime() - start.getTime();
  assert(result === undefined);
  assert(diff >= 100);
});
