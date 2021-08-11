// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.

/**
 * Returns a new record with all entries of the given record except the ones that have a value that does not match the given predicate
 *
 * Example:
 *
 * ```ts
 * import { filterValues } from "./filter_values.ts";
 * import { assertEquals } from "../testing/asserts.ts";
 *
 * type Person = { age: number };
 *
 * const people: Record<string, Person> = {
 *     'Arnold': { age: 37 },
 *     'Sarah': { age: 7 },
 *     'Kim': { age: 23 },
 * };
 * const adults = filterValues(people, it => it.age >= 18)
 *
 * assertEquals(adults, {
 *     'Arnold': { age: 37 },
 *     'Kim': { age: 23 },
 * })
 * ```
 */
export function filterValues<T>(
  record: Record<string, T>,
  predicate: (value: T) => boolean,
): Record<string, T> {
  const ret: Record<string, T> = {};
  const entries = Object.entries(record);

  for (const [key, value] of entries) {
    if (predicate(value)) {
      ret[key] = value;
    }
  }

  return ret;
}
