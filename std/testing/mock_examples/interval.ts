// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
export function secondInterval(cb: () => void): number {
  // @ts-expect-error
  return setInterval(cb, 1000);
}
