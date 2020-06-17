import * as async from "./std/async/mod.ts";
import * as bytes from "./std/bytes/mod.ts";
import * as datetime from "./std/datetime/mod.ts";

export { async, bytes, datetime };

import * as base32 from "./std/encoding/base32.ts";
import * as base64 from "./std/encoding/base64.ts";
import * as base64url from "./std/encoding/base64url.ts";
import * as hex from "./std/encoding/hex.ts";
import * as toml from "./std/encoding/toml.ts";
import * as utf8 from "./std/encoding/utf8.ts";

export const encoding = { base32, base64, base64url, hex, toml, utf8 };

import * as fmt from "./std/fmt/printf.ts";
export { fmt };

import * as fnv from "./std/hash/fnv.ts";
import * as md5 from "./std/hash/md5.ts";
import * as sha1 from "./std/hash/sha1.ts";
import * as sha3 from "./std/hash/sha3.ts";
import * as sha256 from "./std/hash/sha256.ts";
import * as sha512 from "./std/hash/sha512.ts";

export const hash = { fnv, md5, sha1, sha3, sha256, sha512 };

import * as buffer from "./std/node/buffer.ts";
import * as events from "./std/node/events.ts";
import * as path from "./std/path/mod.ts";
import * as querystring from "./std/node/querystring.ts";
import * as timers from "./std/node/timers.ts";
import * as url from "./std/node/url.ts";
import * as util from "./std/node/util.ts";

export const node = { buffer, events, path, querystring, timers, url, util };

export { path };

import * as asserts from "./std/testing/asserts.ts";
import * as bench from "./std/testing/bench.ts";
import * as diff from "./std/testing/diff.ts";

export const testing = { asserts, bench, diff };

import * as uuid from "./std/uuid/mod.ts";
export { uuid };

export { VERSION } from "./std/version.ts";
