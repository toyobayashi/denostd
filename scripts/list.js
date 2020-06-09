module.exports = [
  {
    path: 'bytes/mod.ts',
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
    path: 'testing/bench.ts',
    opts: [
      {
        type: 'replace',
        test: 'const { noColor } = Deno;',
        value: `const noColor = true;`
      }
    ]
  },
  {
    path: 'async/delay.ts',
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
    path: '_util/deep_assign.ts',
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
  }
]
