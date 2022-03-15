class Exception extends Error {
  constructor (message?: string) {
    super(message)
    const ErrorConstructor: any = new.target
    const proto = ErrorConstructor.prototype

    if (!(this instanceof Exception)) {
      const setPrototypeOf = (Object as any).setPrototypeOf
      if (typeof setPrototypeOf === 'function') {
        setPrototypeOf.call(Object, this, proto)
      } else {
        (this as any).__proto__ = proto
      }
      if (typeof (Error as any).captureStackTrace === 'function') {
        (Error as any).captureStackTrace(this, ErrorConstructor)
      }
    }
  }
}

Object.defineProperty(Exception.prototype, 'name', {
  configurable: true,
  writable: true,
  value: 'Exception'
})


class BadResource extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "BadResource";
  }
}

class Interrupted extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "Interrupted";
  }
}

class NotFound extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "NotFound";
  }
}

class PermissionDenied extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "PermissionDenied";
  }
}

class ConnectionRefused extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "ConnectionRefused";
  }
}

class ConnectionReset extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "ConnectionReset";
  }
}

class ConnectionAborted extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "ConnectionAborted";
  }
}

class NotConnected extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "NotConnected";
  }
}

class AddrInUse extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "AddrInUse";
  }
}

class AddrNotAvailable extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "AddrNotAvailable";
  }
}

class BrokenPipe extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "BrokenPipe";
  }
}

class AlreadyExists extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "AlreadyExists";
  }
}

class InvalidData extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "InvalidData";
  }
}

class TimedOut extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "TimedOut";
  }
}

class WriteZero extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "WriteZero";
  }
}

class UnexpectedEof extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "UnexpectedEof";
  }
}

class Http extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "Http";
  }
}

class Busy extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "Busy";
  }
}

class NotSupported extends Exception {
  constructor(msg) {
    super(msg);
    this.name = "NotSupported";
  }
}

const errors = {
  NotFound,
  PermissionDenied,
  ConnectionRefused,
  ConnectionReset,
  ConnectionAborted,
  NotConnected,
  AddrInUse,
  AddrNotAvailable,
  BrokenPipe,
  AlreadyExists,
  InvalidData,
  TimedOut,
  Interrupted,
  WriteZero,
  UnexpectedEof,
  BadResource,
  Http,
  Busy,
  NotSupported,
};

export { errors };
