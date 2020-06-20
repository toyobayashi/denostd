// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { assert, assertEquals } from "../../../testing/asserts.ts";
import { generate, validate } from "../../v1.ts";

Deno.test({
  name: "[UUID] test_uuid_v1",
  fn(): void {
    const u = generate();
    assertEquals(typeof u, "string", "returns a string");
    assert(u !== "", "return string is not empty");
  },
});

Deno.test({
  name: "[UUID] test_uuid_v1_format",
  fn(): void {
    for (let i = 0; i < 10000; i++) {
      const u = generate() as string;
      assert(validate(u), `${u} is not a valid uuid v1`);
    }
  },
});

Deno.test({
  name: "[UUID] test_uuid_v1_static",
  fn(): void {
    const v1options = {
      node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
      clockseq: 0x1234,
      msecs: new Date("2011-11-01").getTime(),
      nsecs: 5678,
    };
    const u = generate(v1options);
    assertEquals(u, "710b962e-041c-11e1-9234-0123456789ab");
  },
});
