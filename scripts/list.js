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
        value: `const isWindows = (${isNode} ? (process.platform === "win32") : navigator.appVersion.includes("Win"));`
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
  }
]
