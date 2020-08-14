const isNode = '(typeof process !== "undefined" && (process as any).browser === undefined)'

module.exports = [
  {
    path: 'std/testing/bench.ts',
    opts: [
      {
        type: 'replace',
        test: /Deno\.noColor/g,
        value: `(!${isNode})`
      }
    ]
  },
  {
    path: 'std/async/delay.ts',
    opts: [
      {
        type: 'replace',
        test: '(res): number',
        value: '(res): any'
      }
    ]
  },
  {
    path: 'std/_util/deep_assign.ts',
    opts: [
      {
        type: 'replace',
        test: /(if\s*\(!source.*\{\r?\n\s*)(return;)/,
        value: '$1return undefined;'
      }
    ]
  },
  {
    path: 'std/fmt/colors.ts',
    opts: [
      {
        type: 'replace',
        test: /const\s+noColor\s+=.+;/g,
        value: `const noColor = (!${isNode});`
      }
    ]
  },
  {
    path: 'std/fmt/printf.ts',
    opts: [
      {
        type: 'replace',
        test: 'Deno.stdout.writeSync(new TextEncoder().encode(s));',
        value: '(typeof process !== "undefined" && typeof process.stdout !== "undefined") ? process.stdout.write(new TextEncoder().encode(s)) : console.log(s);'
      },
      {
        type: 'insert',
        line: 0,
        value: `import * as Deno from "../../polyfill/deno.ts";`
      }
    ]
  },
  {
    path: 'std/testing/asserts.ts',
    opts: [
      {
        type: 'replace',
        test: 'Deno.inspect',
        value: 'globalThis.Deno.inspect'
      }
    ]
  },
  {
    path: 'std/path/_constants.ts',
    opts: [
      {
        type: 'replace',
        test: /let NATIVE_OS.*(.*(\r?\n))*export const isWindows = NATIVE_OS == "windows";/g,
        value: `
let NATIVE_OS: "linux" | "darwin" | "windows" = "linux";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const navigator = (globalThis as any).navigator;
if (globalThis.Deno != null) {
  NATIVE_OS = globalThis.Deno.build.os;
} else if (navigator?.appVersion?.includes?.("Win") ?? false) {
  NATIVE_OS = "windows";
} else if (${isNode}) {
  NATIVE_OS = (process.platform === "win32") ? "windows" : (process.platform as any);
}
// TODO(nayeemrmn): Improve OS detection in browsers beyond Windows.

export const isWindows = NATIVE_OS == "windows";`
      }
    ]
  },
  {
    path: 'std/path/posix.ts',
    opts: [
      {
        type: 'replace',
        test: /Deno\.cwd\(\)/g,
        value: `(${isNode} ? process.cwd() : "/")`
      },
      {
        type: 'replace',
        test: 'new URL(url)',
        value: 'new URL(url as any)'
      }
    ]
  },
  {
    path: 'std/path/win32.ts',
    opts: [
      {
        type: 'replace',
        test: /Deno\.cwd\(\)/g,
        value: `(${isNode} ? process.cwd() : "C:\\\\")`
      },
      {
        type: 'replace',
        test: /Deno\.env\.get\(`=\$\{resolvedDevice\}`\)/g,
        value: `(${isNode} ? process.env[\`=\$\{resolvedDevice\}\`] : "C:\\\\")`
      },
      {
        type: 'replace',
        test: 'new URL(url)',
        value: 'new URL(url as any)'
      }
    ]
  },
  {
    path: 'std/node/querystring.ts',
    opts: [
      {
        type: 'insert',
        line: 0,
        value: `import * as Deno from "../../polyfill/deno.ts";`
      }
    ]
  },
  {
    path: 'std/node/timers.ts',
    opts: [
      {
        type: 'replace',
        test: /window\./g,
        value: 'globalThis.'
      },
      {
        type: 'replace',
        test: /(setTimeout\(cb, 0, \.\.\.args\));/g,
        value: '$1 as any;'
      }
    ]
  },
  {
    path: 'std/node/url.ts',
    opts: [
      {
        type: 'insert',
        line: 0,
        value: `import * as Deno from "../../polyfill/deno.ts";`
      },
      {
        type: 'replace',
        test: /const isWindows = Deno\.build.+?;/g,
        value: `const isWindows = (${isNode} ? (process.platform === "win32") : navigator.appVersion.includes("Win"));`
      }
    ]
  },
  {
    path: 'std/node/buffer.ts',
    opts: [
      {
        type: 'replace',
        test: /(Object\.defineProperty\(globalThis,\s*"Buffer",\s*\{(.*\r?\n)*\}\);)/g,
        value: `if (typeof (globalThis as any).Buffer !== "function") $1`
      }
    ]
  },
  {
    path: 'std/encoding/base64.ts',
    opts: [
      {
        type: 'replace',
        test: /window\.btoa\((.+?)\)/g,
        value: `(typeof window !== "undefined" ? window.btoa($1) : Buffer.from($1).toString("base64"))`
      },
      {
        type: 'replace',
        test: /window\.atob\((.+?)\)/g,
        value: `(typeof window !== "undefined" ? window.atob($1) : Buffer.from($1, "base64").toString())`
      }
    ]
  },
  {
    path: 'std/uuid/v1.ts',
    opts: [
      {
        type: 'replace',
        test: /(crypto\.getRandomValues\(new\sUint8Array\((.+?)\)\))/g,
        value: `(${isNode} ? new Uint8Array((process as any).mainModule.require("crypto").randomBytes($2)) : $1)`
      }
    ]
  },
  {
    path: 'std/uuid/v4.ts',
    opts: [
      {
        type: 'replace',
        test: /(crypto\.getRandomValues\(new\sUint8Array\((.+?)\)\))/g,
        value: `(${isNode} ? new Uint8Array((process as any).mainModule.require("crypto").randomBytes($2)) : $1)`
      }
    ]
  },
  {
    path: 'std/node/_util/_util_promisify.ts',
    opts: [
      {
        type: 'replace',
        test: /\/\/ @ts-expect-error.*/g,
        value: `// @ts-ignore`
      }
    ]
  },
  {
    path: 'std/node/util.ts',
    opts: [
      {
        type: 'insert',
        line: 0,
        value: `import * as Deno from "../../polyfill/deno.ts";`
      }
    ]
  }
]
