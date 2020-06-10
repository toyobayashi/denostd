module.exports = [
  {
    path: 'std/bytes/mod.ts',
    opts: [
      {
        type: 'replace',
        test: 'import { copyBytes } from "../io/util.ts";',
        value:
`function copyBytes(src: Uint8Array, dst: Uint8Array, off = 0): number {
  off = Math.max(0, Math.min(off, dst.byteLength));
  const dstBytesAvailable = dst.byteLength - off;
  if (src.byteLength > dstBytesAvailable) {
    src = src.subarray(0, dstBytesAvailable);
  }
  dst.set(src, off);
  return src.byteLength;
}`
      }
    ]
  },
  {
    path: 'std/testing/bench.ts',
    opts: [
      {
        type: 'replace',
        test: 'const { noColor } = Deno;',
        value: `const noColor = true;`
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
    path: 'std/fmt/printf.ts',
    opts: [
      {
        type: 'replace',
        test: 'Deno.stdout.writeSync(new TextEncoder().encode(s));',
        value: 'typeof process !== "undefined" ? process.stdout.write(new TextEncoder().encode(s)) : console.log(s);'
      },
      {
        type: 'insert',
        line: 0,
        value: `import * as Deno from "../../polyfill/deno.ts";`
      }
    ]
  },
  {
    path: 'cli/js/web/console.ts',
    opts: [
      {
        type: 'replace',
        test: 'const [state, result] = Deno.core.getPromiseDetails(value);',
        value: 'const [state, result] = [-1, "[Not Implemented]", value];'
      }
    ]
  },
  {
    path: 'std/testing/asserts.ts',
    opts: [
      {
        type: 'replace',
        test: 'let string = globalThis.Deno ? Deno.inspect(v) : String(v);',
        value: 'let string = globalThis.Deno ? globalThis.Deno.inspect(v) : String(v);'
      }
    ]
  },
  {
    path: 'cli/js/web/util.ts',
    opts: [
      {
        type: 'replace',
        test: /import\s+.+?\s+from\s+".\/dom_exception\.ts";/g,
        value: ''
      },
      {
        type: 'replace',
        test: /throw new DOMException\((.+?),\s*(.+?)\)/g,
        value: 'throw new Error($1)'
      }
    ]
  },
  {
    path: 'std/path/_constants.ts',
    opts: [
      {
        type: 'replace',
        test: /let isWindows = false.*(\r?\n.*)*.*includes\("Win"\);\r?\n\}/g,
        value: 'const isWindows = (typeof process !== "undefined" ? (process.platform === "win32") : navigator.appVersion.includes("Win"));'
      }
    ]
  },
  {
    path: 'std/path/posix.ts',
    opts: [
      {
        type: 'replace',
        test: /Deno\.cwd\(\)/g,
        value: '(typeof process !== "undefined" ? process.cwd() : "/")'
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
        value: '(typeof process !== "undefined" ? process.cwd() : "C:\\\\")'
      },
      {
        type: 'replace',
        test: /Deno\.env\.get\(`=\$\{resolvedDevice\}`\)/g,
        value: '(typeof process !== "undefined" ? process.env[`=${resolvedDevice}`] : "C:\\\\")'
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
        value: 'const isWindows = (typeof process !== "undefined" ? (process.platform === "win32") : navigator.appVersion.includes("Win"));'
      }
    ]
  }
]
