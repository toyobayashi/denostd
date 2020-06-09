# encoding

Helper module for dealing with external data structures.

- [`base32`](#base32)
- [`binary`](#binary)
- [`csv`](#csv)
- [`toml`](#toml)
- [`yaml`](#yaml)

## Binary

Implements equivalent methods to Go's `encoding/binary` package.

Available Functions:

```typescript
sizeof(dataType: RawTypes): number
getNBytes(r: Deno.Reader, n: number): Promise<Uint8Array>
varnum(b: Uint8Array, o: VarnumOptions = {}): number | null
varbig(b: Uint8Array, o: VarbigOptions = {}): bigint | null
putVarnum(b: Uint8Array, x: number, o: VarnumOptions = {}): number
putVarbig(b: Uint8Array, x: bigint, o: VarbigOptions = {}): number
readVarnum(r: Deno.Reader, o: VarnumOptions = {}): Promise<number>
readVarbig(r: Deno.Reader, o: VarbigOptions = {}): Promise<bigint>
writeVarnum(w: Deno.Writer, x: number, o: VarnumOptions = {}): Promise<number>
writeVarbig(w: Deno.Writer, x: bigint, o: VarbigOptions = {}): Promise<number>
```

## CSV

### API

#### `readMatrix(reader: BufReader, opt: ReadOptions = { comma: ",", trimLeadingSpace: false, lazyQuotes: false }): Promise<string[][]>`

Parse the CSV from the `reader` with the options provided and return
`string[][]`.

#### `parse(input: string | BufReader, opt: ParseOptions = { header: false }): Promise<unknown[]>`:

Parse the CSV string/buffer with the options provided. The result of this
function is as follows:

- If you don't provide both `opt.header` and `opt.parse`, it returns
  `string[][]`.
- If you provide `opt.header` but not `opt.parse`, it returns `object[]`.
- If you provide `opt.parse`, it returns an array where each element is the
  value returned from `opt.parse`.

##### `ParseOptions`

- **`header: boolean | string[] | HeaderOptions[];`**: If a boolean is provided,
  the first line will be used as Header definitions. If `string[]` or
  `HeaderOptions[]` those names will be used for header definition.
- **`parse?: (input: unknown) => unknown;`**: Parse function for the row, which
  will be executed after parsing of all columns. Therefore if you don't provide
  header and parse function with headers, input will be `string[]`.

##### `HeaderOptions`

- **`name: string;`**: Name of the header to be used as property.
- **`parse?: (input: string) => unknown;`**: Parse function for the column. This
  is executed on each entry of the header. This can be combined with the Parse
  function of the rows.

##### `ReadOptions`

- **`comma?: string;`**: Character which separates values. Default: `','`
- **`comment?: string;`**: Character to start a comment. Default: `'#'`
- **`trimLeadingSpace?: boolean;`**: Flag to trim the leading space of the
  value. Default: `false`
- **`lazyQuotes?: boolean;`**: Allow unquoted quote in a quoted field or non
  double quoted quotes in quoted field. Default: 'false`
- **`fieldsPerRecord?`**: Enabling the check of fields for each row. If == 0,
  first row is used as referral for the number of fields.

### Usage

```ts
const string = "a,b,c\nd,e,f";

console.log(
  await parse(string, {
    header: false,
  })
);
// output:
// [["a", "b", "c"], ["d", "e", "f"]]
```

## TOML

This module parse TOML files. It follows as much as possible the
[TOML specs](https://github.com/toml-lang/toml). Be sure to read the supported
types as not every specs is supported at the moment and the handling in
TypeScript side is a bit different.

### Supported types and handling

- :heavy_check_mark: [Keys](https://github.com/toml-lang/toml#string)
- :exclamation: [String](https://github.com/toml-lang/toml#string)
- :heavy_check_mark:
  [Multiline String](https://github.com/toml-lang/toml#string)
- :heavy_check_mark: [Literal String](https://github.com/toml-lang/toml#string)
- :exclamation: [Integer](https://github.com/toml-lang/toml#integer)
- :heavy_check_mark: [Float](https://github.com/toml-lang/toml#float)
- :heavy_check_mark: [Boolean](https://github.com/toml-lang/toml#boolean)
- :heavy_check_mark:
  [Offset Date-time](https://github.com/toml-lang/toml#offset-date-time)
- :heavy_check_mark:
  [Local Date-time](https://github.com/toml-lang/toml#local-date-time)
- :heavy_check_mark: [Local Date](https://github.com/toml-lang/toml#local-date)
- :exclamation: [Local Time](https://github.com/toml-lang/toml#local-time)
- :heavy_check_mark: [Table](https://github.com/toml-lang/toml#table)
- :heavy_check_mark:
  [Inline Table](https://github.com/toml-lang/toml#inline-table)
- :exclamation:
  [Array of Tables](https://github.com/toml-lang/toml#array-of-tables)

:exclamation: _Supported with warnings see [Warning](#Warning)._

#### :warning: Warning

##### String

- Regex : Due to the spec, there is no flag to detect regex properly in a TOML
  declaration. So the regex is stored as string.

##### Integer

For **Binary** / **Octal** / **Hexadecimal** numbers, they are stored as string
to be not interpreted as Decimal.

##### Local Time

Because local time does not exist in JavaScript, the local time is stored as a
string.

##### Inline Table

Inline tables are supported. See below:

```toml
animal = { type = { name = "pug" } }
## Output
animal = { type.name = "pug" }
## Output { animal : { type : { name : "pug" } }
animal.as.leaders = "tosin"
## Output { animal: { as: { leaders: "tosin" } } }
"tosin.abasi" = "guitarist"
## Output
"tosin.abasi" : "guitarist"
```

##### Array of Tables

At the moment only simple declarations like below are supported:

```toml
[[bin]]
name = "deno"
path = "cli/main.rs"

[[bin]]
name = "deno_core"
path = "src/foo.rs"

[[nib]]
name = "node"
path = "not_found"
```

will output:

```json
{
  "bin": [
    { "name": "deno", "path": "cli/main.rs" },
    { "name": "deno_core", "path": "src/foo.rs" }
  ],
  "nib": [{ "name": "node", "path": "not_found" }]
}
```

### Usage

#### Parse

```ts
import { parse } from "./parser.ts";
import { readFileStrSync } from "../fs/read_file_str.ts";

const tomlObject = parse(readFileStrSync("file.toml"));

const tomlString = 'foo.bar = "Deno"';
const tomlObject22 = parse(tomlString);
```

#### Stringify

```ts
import { stringify } from "./parser.ts";
const obj = {
  bin: [
    { name: "deno", path: "cli/main.rs" },
    { name: "deno_core", path: "src/foo.rs" },
  ],
  nib: [{ name: "node", path: "not_found" }],
};
const tomlString = stringify(obj);
```

## YAML

YAML parser / dumper for Deno

Heavily inspired from [js-yaml]

### Basic usage

`parse` parses the yaml string, and `stringify` dumps the given object to YAML
string.

```ts
import { parse, stringify } from "https://deno.land/std/encoding/yaml.ts";

const data = parse(`
foo: bar
baz:
  - qux
  - quux
`);
console.log(data);
// => { foo: "bar", baz: [ "qux", "quux" ] }

const yaml = stringify({ foo: "bar", baz: ["qux", "quux"] });
console.log(yaml);
// =>
// foo: bar
// baz:
//   - qux
//   - quux
```

If your YAML contains multiple documents in it, you can use `parseAll` for
handling it.

```ts
import { parseAll } from "https://deno.land/std/encoding/yaml.ts";

const data = parseAll(`
---
id: 1
name: Alice
---
id: 2
name: Bob
---
id: 3
name: Eve
`);
console.log(data);
// => [ { id: 1, name: "Alice" }, { id: 2, name: "Bob" }, { id: 3, name: "Eve" } ]
```

### API

#### `parse(str: string, opts?: ParserOption): unknown`

Parses the YAML string with a single document.

#### `parseAll(str: string, iterator?: Function, opts?: ParserOption): unknown`

Parses the YAML string with multiple documents. If the iterator is given, it's
applied to every document instead of returning the array of parsed objects.

#### `stringify(obj: object, opts?: DumpOption): string`

Serializes `object` as a YAML document.

### :warning: Limitations

- `binary` type is currently not stable
- `function`, `regexp`, and `undefined` type are currently not supported

### More example

See https://github.com/nodeca/js-yaml.

## base32

[RFC4648 base32](https://tools.ietf.org/html/rfc4648#section-6) encoder/decoder
for Deno

### Basic usage

`encode` encodes a `Uint8Array` to RFC4648 base32 representation, and `decode`
decodes the given RFC4648 base32 representation to a `Uint8Array`.

```ts
import { encode, decode } from "https://deno.land/std/encoding/base32.ts";

const b32Repr = "RC2E6GA=";

const binaryData = decode(b32Repr);
console.log(binaryData);
// => Uint8Array [ 136, 180, 79, 24 ]

console.log(encode(binaryData));
// => RC2E6GA=
```
