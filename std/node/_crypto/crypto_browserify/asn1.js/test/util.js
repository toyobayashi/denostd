// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// Copyright 2017 Fedor Indutny. All rights reserved. MIT license.

import { assertEquals } from "../../../../../testing/asserts.ts";

export function jsonEqual(a, b) {
  assertEquals(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
}
