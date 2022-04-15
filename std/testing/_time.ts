// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

/** Used internally for testing that fake time uses real time correctly. */
export const _internals = {
  Date,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
};
