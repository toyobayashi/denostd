// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.

/**
 * Returns the last element in the given array matching the given predicate
 *
 * Example:
 *
 * ```ts
 * import { findLast } from "./find_last.ts";
 * import { assertEquals } from "../testing/asserts.ts";
 *
 * const numbers = [ 4, 2, 7 ]
 * const lastEvenNumber = findLast(numbers, it => it % 2 === 0)
 *
 * assertEquals(lastEvenNumber, 2)
 * ```
 */
export function findLast<T>(
  array: Array<T>,
  predicate: (el: T) => boolean,
): T | undefined {
  for (let i = array.length - 1; i >= 0; i -= 1) {
    const element = array[i];

    if (predicate(element)) {
      return element;
    }
  }

  return undefined;
}
