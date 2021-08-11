const { compile } = require('./ts.js')
const srcUtil = require('./src.js')
const { getPath } = require('./path.js')
const { bundle, createConfig, getRollupConfig, outputPrefix, inputPrefix } = require('./rollup.js')
const { extractApi, extractEntryApi } = require('./apiex.js')
const ts = require('typescript')
const { copyFileSync, readFileSync, writeFileSync, fstat } = require('fs')
const { EOL } = require('os')
// const rm = require('fs-extra').removeSync

const list = require('./list.js')

/* const recompileEntries = [
  { entry: 'std/async/mod.ts', compilerOptions: { target: ts.ScriptTarget.ES5, downlevelIteration: true, outDir: getPath(`${inputPrefix}/std/async`) } },
  { entry: 'std/testing/asserts.ts', compilerOptions: { target: ts.ScriptTarget.ES5, downlevelIteration: true, outDir: getPath(`${inputPrefix}/std`) } },
  { entry: 'std/testing/bench.ts', compilerOptions: { target: ts.ScriptTarget.ES5, downlevelIteration: true, outDir: getPath(`${inputPrefix}/std`) } }
] */

const browserlist = [
  ...createConfig('async'),
  ...createConfig('bytes'),
  ...createConfig('datetime'),
  ...createConfig('encoding', 'ascii85.js', 'ascii85', 'encoding.ascii85'),
  ...createConfig('encoding', 'base32.js', 'base32', 'encoding.base32'),
  ...createConfig('encoding', 'base64.js', 'base64', 'encoding.base64'),
  ...createConfig('encoding', 'base64url.js', 'base64url', 'encoding.base64url'),
  ...createConfig('encoding', 'hex.js', 'hex', 'encoding.hex'),
  ...createConfig('encoding', 'toml.js', 'toml', 'encoding.toml'),
  ...createConfig('flags'),
  ...createConfig('fmt', 'printf.js', 'printf', 'fmt.printf'),
  ...createConfig('fmt', 'colors.js', 'colors', 'fmt.colors'),
  ...createConfig('hash', 'fnv.js', 'fnv', 'hash.fnv'),
  ...createConfig('hash', 'md5.js', 'md5', 'hash.md5'),
  ...createConfig('hash', 'sha1.js', 'sha1', 'hash.sha1'),
  ...createConfig('hash', 'sha3.js', 'sha3', 'hash.sha3'),
  ...createConfig('hash', 'sha256.js', 'sha256', 'hash.sha256'),
  ...createConfig('hash', 'sha512.js', 'sha512', 'hash.sha512'),
  ...createConfig('node', 'assert.js', 'assert', 'node.assert'),
  ...createConfig('node', 'buffer.js', 'buffer', 'node.buffer'),
  ...createConfig('node', 'console.js', 'console', 'node.console'),
  ...createConfig('node', 'events.js', 'events', 'node.events'),
  ...createConfig('node', 'path.js', 'path', 'node.path'),
  ...createConfig('node', 'querystring.js', 'querystring', 'node.querystring'),
  ...createConfig('node', 'string_decoder.js', 'string_decoder', 'node.string_decoder'),
  ...createConfig('node', 'sys.js', 'sys', 'node.sys'),
  ...createConfig('node', 'timers.js', 'timers', 'node.timers'),
  ...createConfig('node', 'url.js', 'url', 'node.url'),
  ...createConfig('node', 'util.js', 'util', 'node.util'),
  ...createConfig('path'),
  ...createConfig('testing', 'asserts.js', 'asserts', 'testing.asserts'),
  ...createConfig('testing', 'bench.js', 'bench', 'testing.bench'),
  // ...createConfig('testing', 'diff.js', 'diff', 'testing.diff'),
  ...createConfig('uuid'),
  ...([
    getRollupConfig({
      entry: `${inputPrefix}/index.js`,
      output: `denostd`,
      ns: `denostd`,
      minify: false
    }),
    getRollupConfig({
      entry: `${inputPrefix}/index.js`,
      output: `denostd`,
      ns: `denostd`,
      minify: true
    })
  ])
]

function extractApis () {
  extractApi('async')
  extractApi('bytes')
  extractApi('datetime')
  extractApi('encoding', 'ascii85', 'ascii85', 'encoding.ascii85')
  extractApi('encoding', 'base32', 'base32', 'encoding.base32')
  extractApi('encoding', 'base64', 'base64', 'encoding.base64')
  extractApi('encoding', 'base64url', 'base64url', 'encoding.base64url')
  extractApi('encoding', 'hex', 'hex', 'encoding.hex')
  extractApi('encoding', 'toml', 'toml', 'encoding.toml')
  extractApi('flags')
  extractApi('fmt', 'printf', 'printf', 'fmt.printf')
  extractApi('fmt', 'colors', 'colors', 'fmt.colors')
  extractApi('hash', 'fnv', 'fnv', 'hash.fnv')
  extractApi('hash', 'md5', 'md5', 'hash.md5')
  extractApi('hash', 'sha1', 'sha1', 'hash.sha1')
  extractApi('hash', 'sha3', 'sha3', 'hash.sha3')
  extractApi('hash', 'sha256', 'sha256', 'hash.sha256')
  extractApi('hash', 'sha512', 'sha512', 'hash.sha512')

  extractApi('node', 'assert', 'assert', 'node.assert')
  extractApi('node', 'buffer', 'buffer', 'node.buffer')
  // writeFileSync(getPath(outputPrefix, 'node/buffer.d.ts'), readFileSync(getPath(outputPrefix, 'node/buffer.d.ts'), 'utf8') + `${EOL}declare const Buffer: typeof denostd.node.buffer.Buffer;${EOL}`, 'utf8')
  const globalBuffer = `declare type _Buffer = typeof Buffer;
declare global {
    export const Buffer: _Buffer;
}
`
  writeFileSync(getPath('dist/cjs-modern/std/node/buffer.d.ts'), readFileSync(getPath('dist/cjs-modern/std/node/buffer.d.ts'), 'utf8') + `${EOL}${globalBuffer}`, 'utf8')
  writeFileSync(getPath('dist/esm/std/node/buffer.d.ts'), readFileSync(getPath('dist/esm/std/node/buffer.d.ts'), 'utf8') + `${EOL}${globalBuffer}`, 'utf8')
  writeFileSync(getPath('dist/esm-modern/std/node/buffer.d.ts'), readFileSync(getPath('dist/esm-modern/std/node/buffer.d.ts'), 'utf8') + `${EOL}${globalBuffer}`, 'utf8')

  const consoledts = readFileSync(getPath('dist/esm/std/node/console.d.ts'), 'utf8')
  const consoledtsChanged = consoledts
    .replace(/export default console;/, `declare const _default: typeof console;
export default _default;`)
    .replace(/import\("util"\)\.InspectOptions/, 'NodeJS.InspectOptions')
  writeFileSync(getPath('dist/esm/std/node/console.d.ts'), consoledtsChanged, 'utf8')
  extractApi('node', 'console', 'console', 'node.console')
  writeFileSync(getPath('dist/esm/std/node/console.d.ts'), consoledts, 'utf8')

  extractApi('node', 'events', 'events', 'node.events')

  // just copy std/path
  // extractApi('node', 'path', 'path', 'node.path')

  extractApi('node', 'querystring', 'querystring', 'node.querystring')
  extractApi('node', 'string_decoder', 'string_decoder', 'node.string_decoder')
  extractApi('node', 'timers', 'timers', 'node.timers')
  extractApi('node', 'url', 'url', 'node.url')

  /* const dtspath = getPath('dist/esm/std/node/util.d.ts')
  const utildts = readFileSync(dtspath, 'utf8')
  let newCode = utildts.replace(/import\("\.\/_utils"\)\._Text(\S{2})coder/g, 'typeof globalThis.Text$1coder.prototype')
  writeFileSync(dtspath, newCode, 'utf8')
  try {
    extractApi('node', 'util', 'util', 'node.util')
  } catch (err) {
    writeFileSync(dtspath, utildts, 'utf8')
    throw err
  }
  writeFileSync(dtspath, utildts, 'utf8') */

  extractApi('path')
  const dest = getPath(outputPrefix, 'node/path.d.ts')
  const dest2 = getPath(outputPrefix, 'node/path.global.d.ts')
  copyFileSync(getPath(outputPrefix, 'path/path.d.ts'), dest)
  copyFileSync(getPath(outputPrefix, 'path/path.global.d.ts'), dest2)
  const code = readFileSync(dest2, 'utf8').split(/\r?\n/)
  code.splice(1, 0, 'export namespace node {')
  code.push('}')
  writeFileSync(dest2, code.join(EOL), 'utf8')

  extractApi('testing', 'asserts', 'asserts', 'testing.asserts')
  extractApi('testing', 'bench', 'bench', 'testing.bench')
  // extractApi('testing', 'diff', 'diff', 'testing.diff')
  extractApi('uuid')
}

function replaceBufferConstructor (file) {
  const re = /function\s+Buffer\s*\((.*?)\)\s*\{[\s\S]*?(\r?\n)?\}/
  const code = readFileSync(file, 'utf8').replace(re, 'function Buffer(a, b, c) { var r = new Uint8Array(a, b, c); Object.setPrototypeOf(r, Buffer.prototype); return r; }')
  writeFileSync(file, code, 'utf8')
}

/* function avoidRegeneratorRuntime (tsEntries) {
  for (let i = 0; i < tsEntries.length; i++) {
    compile(getPath('tsconfig.browser.json'), tsEntries[i])
  }
} */

async function main () {
  await srcUtil.changeSource(list)
  try {
    console.log('Output dist/cjs ...')
    compile(getPath('tsconfig.legacy.json'))

    console.log('Output dist/cjs-modern ...')
    compile(getPath('tsconfig.json'))

    console.log('Output dist/esm ...')
    compile(getPath('tsconfig.esm.json'))
    replaceBufferConstructor(getPath('dist/cjs/std/node/buffer.js'))
    replaceBufferConstructor(getPath('dist/esm/std/node/buffer.js'))

    console.log('Output dist/esm-modern ...')
    compile(getPath('tsconfig.modern.json'))

    console.log('Output dist/umd ...')
    // compile(getPath('tsconfig.browser.json'))
    // avoidRegeneratorRuntime(recompileEntries)
    // console.log('Output browser code ...')
    await bundle(browserlist)
    // rm(getPath(inputPrefix))
  } catch (err) {
    await srcUtil.restoreSource(list)
    throw err
  }
  await srcUtil.restoreSource(list)

  console.log('Output .d.ts ...')
  extractApis()
  // extractEntryApi()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
