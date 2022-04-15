/** This module is browser compatible. */

import { descend } from "./_comparators.ts";
export * from "./_comparators.ts";

/** Swaps the values at two indexes in an array. */
function swap<T>(array: T[], a: number, b: number) {
  const temp: T = array[a];
  array[a] = array[b];
  array[b] = temp;
}

/**
 * A priority queue implemented with a binary heap. The heap is in decending order by default,
 * using JavaScript's built in comparison operators to sort the values.
 */
export class BinaryHeap<T> implements Iterable<T> {
  private data: T[] = [];
  constructor(private compare: (a: T, b: T) => number = descend) {}

  /** Creates a new binary heap from an array like or iterable object. */
  static from<T>(
    collection: ArrayLike<T> | Iterable<T> | BinaryHeap<T>,
  ): BinaryHeap<T>;
  static from<T>(
    collection: ArrayLike<T> | Iterable<T> | BinaryHeap<T>,
    options: {
      compare?: (a: T, b: T) => number;
    },
  ): BinaryHeap<T>;
  static from<T, U, V>(
    collection: ArrayLike<T> | Iterable<T> | BinaryHeap<T>,
    options: {
      compare?: (a: U, b: U) => number;
      map: (value: T, index: number) => U;
      thisArg?: V;
    },
  ): BinaryHeap<U>;
  static from<T, U, V>(
    collection: ArrayLike<T> | Iterable<T> | BinaryHeap<T>,
    options?: {
      compare?: (a: U, b: U) => number;
      map?: (value: T, index: number) => U;
      thisArg?: V;
    },
  ): BinaryHeap<U> {
    let result: BinaryHeap<U>;
    let unmappedValues: ArrayLike<T> | Iterable<T> = [];
    if (collection instanceof BinaryHeap) {
      result = new BinaryHeap(
        options?.compare ?? (collection as unknown as BinaryHeap<U>).compare,
      );
      if (options?.compare || options?.map) {
        unmappedValues = collection.data;
      } else {
        result.data = Array.from(collection.data as unknown as U[]);
      }
    } else {
      result = options?.compare
        ? new BinaryHeap(options.compare)
        : new BinaryHeap();
      unmappedValues = collection;
    }
    const values: Iterable<U> = options?.map
      ? Array.from(unmappedValues, options.map, options.thisArg)
      : unmappedValues as U[];
    result.push(...values);
    return result;
  }

  /** The amount of values stored in the binary heap. */
  get length(): number {
    return this.data.length;
  }

  /** Returns the greatest value in the binary heap, or undefined if it is empty. */
  peek(): T | undefined {
    return this.data[0];
  }

  /** Removes the greatest value from the binary heap and returns it, or null if it is empty. */
  pop(): T | undefined {
    const size: number = this.data.length - 1;
    swap(this.data, 0, size);
    let parent = 0;
    let right: number = 2 * (parent + 1);
    let left: number = right - 1;
    while (left < size) {
      if (
        this.compare(this.data[left], this.data[parent]) < 0 &&
        (right === size || this.compare(this.data[left], this.data[right]) < 0)
      ) {
        swap(this.data, parent, left);
        parent = left;
      } else if (
        right < size && this.compare(this.data[right], this.data[parent]) < 0
      ) {
        swap(this.data, parent, right);
        parent = right;
      } else {
        break;
      }
      right = 2 * (parent + 1);
      left = right - 1;
    }
    return this.data.pop();
  }

  /** Adds values to the binary heap. */
  push(...values: T[]): number {
    for (const value of values) {
      let index: number = this.data.length;
      let parent: number = Math.floor(index / 2);
      this.data.push(value);
      while (
        index !== 0 && this.compare(this.data[index], this.data[parent]) < 0
      ) {
        swap(this.data, parent, index);
        index = parent;
        parent = Math.floor(index / 2);
      }
    }
    return this.data.length;
  }

  /** Removes all values from the binary heap. */
  clear(): void {
    this.data = [];
  }

  /** Checks if the binary heap is empty. */
  isEmpty(): boolean {
    return this.data.length === 0;
  }

  /** Returns an iterator for retrieving and removing values from the binary heap. */
  *drain(): IterableIterator<T> {
    while (!this.isEmpty()) {
      yield this.pop() as T;
    }
  }

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.drain();
  }
}
