import { errors } from './errors.ts'

export function inspect(value: any, opts?: any): string {
  if (typeof process !== "undefined" && (process as any).browser === undefined) {
    return process.mainModule.require('util').inspect(value, opts);
  }

  opts = opts ?? {};
  opts._valueCache = opts._valueCache ?? [];

  if (typeof value === 'string') {
    return value;
  }

  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'function') {
    return `[${value.constructor.name}${value.name ? (': ' + value.name) : ''}]`;
  }

  if (value instanceof Date) {
    return value.toJSON();
  }
  if (typeof value === 'symbol' || value instanceof RegExp) {
    return value.toString();
  }
  if (value instanceof globalThis.Promise) {
    return 'Promise { <unknown> }';
  }
  if (typeof value === "number" && isNaN(value)) {
    return 'NaN';
  }
  if (value === Infinity) {
    return 'Infinity'
  }
  if (value === -Infinity) {
    return '-Infinity'
  }

  const replacer = (_key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (opts._valueCache.indexOf(value) !== -1) {
        return '[Circular]';
      }
      opts._valueCache.push(value);
    }
    return value;
  }
  const json = JSON.stringify(value, replacer, 2);
  if (typeof Symbol === 'function' && typeof Symbol.toStringTag !== 'undefined' && typeof value[Symbol.toStringTag] === 'function') {
    return `${(value[Symbol.toStringTag]() + ' ')}${json}`;
  } else {
    if (Object.prototype.toString.call(value) === '[object Object]' && value.constructor.name === 'Object') {
      return json;
    } else {
      return `${value.constructor.name} ${json}`;
    }
  }
}

declare global {
  interface Object {
    hasOwn (obj: object, key: string | number | symbol): boolean
  }
}

Object.hasOwn = Object.hasOwn || function (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export { errors };
