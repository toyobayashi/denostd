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
        type: 'remove',
        line: [2, 9]
      },
      {
        type: 'insert',
        line: 2,
        value: `
export function delay(ms: number): Promise<void> {
  return new Promise((res) => {
    setTimeout((): void => {
      res();
    }, ms)
  });
}`
      }
    ]
  },
  {
    path: 'std/_util/deep_assign.ts',
    opts: [
      {
        type: 'remove',
        line: 10
      },
      {
        type: 'insert',
        line: 10,
        value: `return undefined;`
      }
    ]
  },
  {
    path: 'std/fmt/printf.ts',
    opts: [
      {
        type: 'replace',
        test: 'Deno.stdout.writeSync(new TextEncoder().encode(s));',
        value: 'console.log(new TextEncoder().encode(s));'
      },
      {
        type: 'insert',
        line: 0,
        value: `import * as Deno from "../../polyfill/deno.ts";`
      }
      // {
      //   type: 'replace',
      //   test: /Deno\.inspect\(/g,
      //   value: 'console.log(new TextEncoder().encode(s));'
      // }
    ]
  },
  {
    path: 'cli/js/web/console.ts',
    opts: [
      {
        type: 'replace',
        test: 'const [state, result] = Deno.core.getPromiseDetails(value);',
        value: 'const [state, result] = [-1, "[Not Implemented]", value]'
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
  }
]
