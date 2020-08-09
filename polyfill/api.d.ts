declare interface String {
  replaceAll(searchValue: string | RegExp, newSubstr: string): string
  replaceAll(searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => string): string
}

declare interface ReadableStream<R = any> {
  getIterator(): AsyncIterableIterator<R>
}

declare namespace Deno {
  export const build: {
    os: "darwin" | "linux" | "windows"
  }

  export function inspect (v: any, options?: any): string
}
