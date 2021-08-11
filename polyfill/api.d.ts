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

  export namespace errors {
    export class NotFound extends Error {
      constructor(msg?: string)
    }

    export class PermissionDenied extends Error {
      constructor(msg?: string)
    }

    export class ConnectionRefused extends Error {
      constructor(msg?: string)
    }

    export class ConnectionReset extends Error {
      constructor(msg?: string)
    }

    export class ConnectionAborted extends Error {
      constructor(msg?: string)
    }

    export class NotConnected extends Error {
      constructor(msg?: string)
    }

    export class AddrInUse extends Error {
      constructor(msg?: string)
    }

    export class AddrNotAvailable extends Error {
      constructor(msg?: string)
    }

    export class BrokenPipe extends Error {
      constructor(msg?: string)
    }

    export class AlreadyExists extends Error {
      constructor(msg?: string)
    }

    export class InvalidData extends Error {
      constructor(msg?: string)
    }

    export class TimedOut extends Error {
      constructor(msg?: string)
    }

    export class Interrupted extends Error {
      constructor(msg?: string)
    }

    export class WriteZero extends Error {
      constructor(msg?: string)
    }

    export class UnexpectedEof extends Error {
      constructor(msg?: string)
    }

    export class BadResource extends Error {
      constructor(msg?: string)
    }

    export class Http extends Error {
      constructor(msg?: string)
    }

    export class Busy extends Error {
      constructor(msg?: string)
    }

    export class NotSupported extends Error {
      constructor(msg?: string)
    }
  }
}

declare class WeakRef<T extends object> {
  constructor (value: T)
  deref (): T | undefined
}

declare interface Crypto {
  randomUUID (): string
}
