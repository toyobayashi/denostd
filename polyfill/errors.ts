// Warning! The values in this enum are duplicated in cli/op_error.rs
// Update carefully!
const ErrorKind = {
  1: "NotFound",
  2: "PermissionDenied",
  3: "ConnectionRefused",
  4: "ConnectionReset",
  5: "ConnectionAborted",
  6: "NotConnected",
  7: "AddrInUse",
  8: "AddrNotAvailable",
  9: "BrokenPipe",
  10: "AlreadyExists",
  13: "InvalidData",
  14: "TimedOut",
  15: "Interrupted",
  16: "WriteZero",
  17: "UnexpectedEof",
  18: "BadResource",
  19: "Http",
  20: "URIError",
  21: "TypeError",
  22: "Other",
  23: "Busy",

  NotFound: 1,
  PermissionDenied: 2,
  ConnectionRefused: 3,
  ConnectionReset: 4,
  ConnectionAborted: 5,
  NotConnected: 6,
  AddrInUse: 7,
  AddrNotAvailable: 8,
  BrokenPipe: 9,
  AlreadyExists: 10,
  InvalidData: 13,
  TimedOut: 14,
  Interrupted: 15,
  WriteZero: 16,
  UnexpectedEof: 17,
  BadResource: 18,
  Http: 19,
  URIError: 20,
  TypeError: 21,
  Other: 22,
  Busy: 23,
};

function getErrorClass(kind): { new (msg?: string ) } | undefined {
  switch (kind) {
    case ErrorKind.TypeError:
      return TypeError;
    case ErrorKind.Other:
      return Error;
    case ErrorKind.URIError:
      return URIError;
    case ErrorKind.NotFound:
      return NotFound;
    case ErrorKind.PermissionDenied:
      return PermissionDenied;
    case ErrorKind.ConnectionRefused:
      return ConnectionRefused;
    case ErrorKind.ConnectionReset:
      return ConnectionReset;
    case ErrorKind.ConnectionAborted:
      return ConnectionAborted;
    case ErrorKind.NotConnected:
      return NotConnected;
    case ErrorKind.AddrInUse:
      return AddrInUse;
    case ErrorKind.AddrNotAvailable:
      return AddrNotAvailable;
    case ErrorKind.BrokenPipe:
      return BrokenPipe;
    case ErrorKind.AlreadyExists:
      return AlreadyExists;
    case ErrorKind.InvalidData:
      return InvalidData;
    case ErrorKind.TimedOut:
      return TimedOut;
    case ErrorKind.Interrupted:
      return Interrupted;
    case ErrorKind.WriteZero:
      return WriteZero;
    case ErrorKind.UnexpectedEof:
      return UnexpectedEof;
    case ErrorKind.BadResource:
      return BadResource;
    case ErrorKind.Http:
      return Http;
    case ErrorKind.Busy:
      return Busy;
    default: return undefined;
  }
}

class NotFound extends Error {
  constructor(msg) {
    super(msg);
    this.name = "NotFound";
  }
}

class PermissionDenied extends Error {
  constructor(msg) {
    super(msg);
    this.name = "PermissionDenied";
  }
}

class ConnectionRefused extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ConnectionRefused";
  }
}

class ConnectionReset extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ConnectionReset";
  }
}

class ConnectionAborted extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ConnectionAborted";
  }
}

class NotConnected extends Error {
  constructor(msg) {
    super(msg);
    this.name = "NotConnected";
  }
}

class AddrInUse extends Error {
  constructor(msg) {
    super(msg);
    this.name = "AddrInUse";
  }
}

class AddrNotAvailable extends Error {
  constructor(msg) {
    super(msg);
    this.name = "AddrNotAvailable";
  }
}

class BrokenPipe extends Error {
  constructor(msg) {
    super(msg);
    this.name = "BrokenPipe";
  }
}

class AlreadyExists extends Error {
  constructor(msg) {
    super(msg);
    this.name = "AlreadyExists";
  }
}

class InvalidData extends Error {
  constructor(msg) {
    super(msg);
    this.name = "InvalidData";
  }
}

class TimedOut extends Error {
  constructor(msg) {
    super(msg);
    this.name = "TimedOut";
  }
}

class Interrupted extends Error {
  constructor(msg) {
    super(msg);
    this.name = "Interrupted";
  }
}

class WriteZero extends Error {
  constructor(msg) {
    super(msg);
    this.name = "WriteZero";
  }
}

class UnexpectedEof extends Error {
  constructor(msg) {
    super(msg);
    this.name = "UnexpectedEof";
  }
}

class BadResource extends Error {
  constructor(msg) {
    super(msg);
    this.name = "BadResource";
  }
}

class Http extends Error {
  constructor(msg) {
    super(msg);
    this.name = "Http";
  }
}

class Busy extends Error {
  constructor(msg) {
    super(msg);
    this.name = "Busy";
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
};

export { errors, getErrorClass };
