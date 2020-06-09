// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

export { ParseOptions, parse, parseAll } from "./_yaml/parse.ts";
export {
  DumpOptions as StringifyOptions,
  stringify,
} from "./_yaml/stringify.ts";
export { SchemaDefinition } from "./_yaml/schema.ts";
export { StyleVariant } from "./_yaml/type.ts";
export {
  CORE_SCHEMA,
  DEFAULT_SCHEMA,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
} from "./_yaml/schema/mod.ts";
