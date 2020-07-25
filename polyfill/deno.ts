import { errors } from './errors.ts'

export function inspect(value: any, opts?: any): string {
  if (typeof process !== "undefined" && (process as any).browser === undefined) {
    return process.mainModule.require('util').inspect(value, opts);
  }

  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'function') {
    return '[Function]';
  }

  if (value instanceof Date) {
    return value.toJSON();
  }
  if (typeof value === 'symbol' || value instanceof RegExp) {
    return value.toString();
  }
  if (value instanceof globalThis.Promise) {
    return '[object Promise]';
  }
  return JSON.stringify(value, null, 2);
}

export { errors };
