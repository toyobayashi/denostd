// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../testing/asserts.ts";
import { existsSync } from "../fs/exists.ts";
import { readFileStrSync } from "../fs/read_file_str.ts";
import * as path from "../path/mod.ts";
import { parse, stringify } from "./toml.ts";

const testFilesDir = path.resolve("encoding", "testdata");

function parseFile(filePath: string): object {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const strFile = readFileStrSync(filePath);
  return parse(strFile);
}

Deno.test({
  name: "[TOML] Strings",
  fn(): void {
    const expected = {
      strings: {
        str0: "deno",
        str1: "Roses are not Deno\nViolets are not Deno either",
        str2: "Roses are not Deno\nViolets are not Deno either",
        str3: "Roses are not Deno\r\nViolets are not Deno either",
        str4: 'this is a "quote"',
        str5: "The quick brown\nfox jumps over\nthe lazy dog.",
        str6: "The quick brown\nfox jumps over\nthe lazy dog.",
        lines:
          "The first newline is\ntrimmed in raw strings.\n   All other " +
          "whitespace\n   is preserved.",
      },
    };
    const actual = parseFile(path.join(testFilesDir, "string.toml"));
    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "[TOML] CRLF",
  fn(): void {
    const expected = { boolean: { bool1: true, bool2: false } };
    const actual = parseFile(path.join(testFilesDir, "CRLF.toml"));
    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "[TOML] Boolean",
  fn(): void {
    const expected = { boolean: { bool1: true, bool2: false } };
    const actual = parseFile(path.join(testFilesDir, "boolean.toml"));
    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "[TOML] Integer",
  fn(): void {
    const expected = {
      integer: {
        int1: 99,
        int2: 42,
        int3: 0,
        int4: -17,
        int5: 1000,
        int6: 5349221,
        int7: 12345,
        hex1: "0xDEADBEEF",
        hex2: "0xdeadbeef",
        hex3: "0xdead_beef",
        oct1: "0o01234567",
        oct2: "0o755",
        bin1: "0b11010110",
      },
    };
    const actual = parseFile(path.join(testFilesDir, "integer.toml"));
    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "[TOML] Float",
  fn(): void {
    const expected = {
      float: {
        flt1: 1.0,
        flt2: 3.1415,
        flt3: -0.01,
        flt4: 5e22,
        flt5: 1e6,
        flt6: -2e-2,
        flt7: 6.626e-34,
        flt8: 224_617.445_991_228,
        sf1: Infinity,
        sf2: Infinity,
        sf3: -Infinity,
        sf4: NaN,
        sf5: NaN,
        sf6: NaN,
      },
    };
    const actual = parseFile(path.join(testFilesDir, "float.toml"));
    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "[TOML] Arrays",
  fn(): void {
    const expected = {
      arrays: {
        data: [
          ["gamma", "delta"],
          [1, 2],
        ],
        hosts: ["alpha", "omega"],
      },
    };
    const actual = parseFile(path.join(testFilesDir, "arrays.toml"));
    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "[TOML] Table",
  fn(): void {
    const expected = {
      deeply: {
        nested: {
          object: {
            in: {
              the: {
                toml: {
                  name: "Tom Preston-Werner",
                },
              },
            },
          },
        },
      },
      servers: {
        alpha: {
          ip: "10.0.0.1",
          dc: "eqdc10",
        },
        beta: {
          ip: "10.0.0.2",
          dc: "eqdc20",
        },
      },
    };
    const actual = parseFile(path.join(testFilesDir, "table.toml"));
    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "[TOML] Simple",
  fn(): void {
    const expected = {
      deno: "is",
      not: "[node]",
      regex: "<ic*s*>",
      NANI: "何?!",
      comment: "Comment inside # the comment",
    };
    const actual = parseFile(path.join(testFilesDir, "simple.toml"));
    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "[TOML] Datetime",
  fn(): void {
    const expected = {
      datetime: {
        odt1: new Date("1979-05-27T07:32:00Z"),
        odt2: new Date("1979-05-27T00:32:00-07:00"),
        odt3: new Date("1979-05-27T00:32:00.999999-07:00"),
        odt4: new Date("1979-05-27 07:32:00Z"),
        ld1: new Date("1979-05-27"),
        lt1: "07:32:00",
        lt2: "00:32:00.999999",
      },
    };
    const actual = parseFile(path.join(testFilesDir, "datetime.toml"));
    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "[TOML] Inline Table",
  fn(): void {
    const expected = {
      inlinetable: {
        nile: {
          also: {
            malevolant: {
              creation: {
                drum: {
                  kit: "Tama",
                },
              },
            },
          },
          derek: {
            roddy: "drummer",
          },
        },
        name: {
          first: "Tom",
          last: "Preston-Werner",
        },
        point: {
          x: 1,
          y: 2,
        },
        dog: {
          type: {
            name: "pug",
          },
        },
        "tosin.abasi": "guitarist",
        animal: {
          as: {
            leaders: "tosin",
          },
        },
      },
    };
    const actual = parseFile(path.join(testFilesDir, "inlineTable.toml"));
    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "[TOML] Array of Tables",
  fn(): void {
    const expected = {
      bin: [
        { name: "deno", path: "cli/main.rs" },
        { name: "deno_core", path: "src/foo.rs" },
      ],
      nib: [{ name: "node", path: "not_found" }],
    };
    const actual = parseFile(path.join(testFilesDir, "arrayTable.toml"));
    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "[TOML] Cargo",
  fn(): void {
    /* eslint-disable @typescript-eslint/camelcase */
    const expected = {
      workspace: { members: ["./", "core"] },
      bin: [{ name: "deno", path: "cli/main.rs" }],
      package: { name: "deno", version: "0.3.4", edition: "2018" },
      dependencies: {
        deno_core: { path: "./core" },
        atty: "0.2.11",
        dirs: "1.0.5",
        flatbuffers: "0.5.0",
        futures: "0.1.25",
        getopts: "0.2.18",
        http: "0.1.16",
        hyper: "0.12.24",
        "hyper-rustls": "0.16.0",
        "integer-atomics": "1.0.2",
        lazy_static: "1.3.0",
        libc: "0.2.49",
        log: "0.4.6",
        rand: "0.6.5",
        regex: "1.1.0",
        remove_dir_all: "0.5.2",
        ring: "0.14.6",
        rustyline: "3.0.0",
        serde_json: "1.0.38",
        "source-map-mappings": "0.5.0",
        tempfile: "3.0.7",
        tokio: "0.1.15",
        "tokio-executor": "0.1.6",
        "tokio-fs": "0.1.5",
        "tokio-io": "0.1.11",
        "tokio-process": "0.2.3",
        "tokio-threadpool": "0.1.11",
        url: "1.7.2",
      },
      target: { "cfg(windows)": { dependencies: { winapi: "0.3.6" } } },
    };
    /* eslint-enable @typescript-eslint/camelcase */
    const actual = parseFile(path.join(testFilesDir, "cargo.toml"));
    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "[TOML] Stringify",
  fn(): void {
    const src = {
      foo: { bar: "deno" },
      this: { is: { nested: "denonono" } },
      "https://deno.land/std": {
        $: "doller",
      },
      "##": {
        deno: {
          "https://deno.land": {
            proto: "https",
            ":80": "port",
          },
        },
      },
      arrayObjects: [{ stuff: "in" }, {}, { the: "array" }],
      deno: "is",
      not: "[node]",
      regex: "<ic*s*>",
      NANI: "何?!",
      comment: "Comment inside # the comment",
      int1: 99,
      int2: 42,
      int3: 0,
      int4: -17,
      int5: 1000,
      int6: 5349221,
      int7: 12345,
      flt1: 1.0,
      flt2: 3.1415,
      flt3: -0.01,
      flt4: 5e22,
      flt5: 1e6,
      flt6: -2e-2,
      flt7: 6.626e-34,
      odt1: new Date("1979-05-01T07:32:00Z"),
      odt2: new Date("1979-05-27T00:32:00-07:00"),
      odt3: new Date("1979-05-27T00:32:00.999999-07:00"),
      odt4: new Date("1979-05-27 07:32:00Z"),
      ld1: new Date("1979-05-27"),
      reg: /foo[bar]/,
      sf1: Infinity,
      sf2: Infinity,
      sf3: -Infinity,
      sf4: NaN,
      sf5: NaN,
      sf6: NaN,
      data: [
        ["gamma", "delta"],
        [1, 2],
      ],
      hosts: ["alpha", "omega"],
    };
    const expected = `deno    = "is"
not     = "[node]"
regex   = "<ic*s*>"
NANI    = "何?!"
comment = "Comment inside # the comment"
int1    = 99
int2    = 42
int3    = 0
int4    = -17
int5    = 1000
int6    = 5349221
int7    = 12345
flt1    = 1
flt2    = 3.1415
flt3    = -0.01
flt4    = 5e+22
flt5    = 1000000
flt6    = -0.02
flt7    = 6.626e-34
odt1    = 1979-05-01T07:32:00.000
odt2    = 1979-05-27T07:32:00.000
odt3    = 1979-05-27T07:32:00.999
odt4    = 1979-05-27T07:32:00.000
ld1     = 1979-05-27T00:00:00.000
reg     = "/foo[bar]/"
sf1     = inf
sf2     = inf
sf3     = -inf
sf4     = NaN
sf5     = NaN
sf6     = NaN
data    = [["gamma","delta"],[1,2]]
hosts   = ["alpha","omega"]

[foo]
bar     = "deno"

[this.is]
nested  = "denonono"

["https://deno.land/std"]
"$"     = "doller"

["##".deno."https://deno.land"]
proto   = "https"
":80"   = "port"

[[arrayObjects]]
stuff   = "in"

[[arrayObjects]]

[[arrayObjects]]
the     = "array"
`;
    const actual = stringify(src);
    assertEquals(actual, expected);
  },
});
