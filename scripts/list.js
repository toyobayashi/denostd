module.exports = [
  {
    path: 'bytes/mod.ts',
    opts: [
      {
        type: 'remove',
        line: 1
      },
      {
        type: 'insert',
        line: 1,
        value: `
function copyBytes(src: Uint8Array, dst: Uint8Array, off = 0): number {
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
        type: 'remove',
        line: 3
      },
      {
        type: 'insert',
        line: 3,
        value: `const noColor = true;`
      }
    ]
  }
]
