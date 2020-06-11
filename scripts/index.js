const { compile } = require('./ts.js')
const srcUtil = require('./src.js')
const { getPath } = require('./path.js')
const { bundle, createConfig, getRollupConfig } = require('./rollup.js')
const { extractApi, extractEntryApi } = require('./apiex.js')
const ts = require('typescript')
const { copyFileSync, readFileSync, writeFileSync } = require('fs')
const { EOL } = require('os')

const list = require('./list.js')

const tsEntries = [
  { entry: 'std/async/mod.ts', compilerOptions: { target: ts.ScriptTarget.ES5, downlevelIteration: true, outDir: getPath('dist/esm/std/async') } },
  { entry: 'std/testing/asserts.ts', compilerOptions: { target: ts.ScriptTarget.ES5, downlevelIteration: true, outDir: getPath('dist/esm/std') } },
  { entry: 'std/testing/bench.ts', compilerOptions: { target: ts.ScriptTarget.ES5, downlevelIteration: true, outDir: getPath('dist/esm/std') } }
]

const browserlist = [
  ...createConfig('async'),
  ...createConfig('bytes'),
  ...createConfig('datetime'),
  ...createConfig('fmt', 'printf.js', 'fmt'),
  ...createConfig('hash', 'fnv.js', 'fnv', 'hash.fnv'),
  ...createConfig('hash', 'md5.js', 'md5', 'hash.md5'),
  ...createConfig('hash', 'sha1.js', 'sha1', 'hash.sha1'),
  ...createConfig('hash', 'sha256.js', 'sha256', 'hash.sha256'),
  ...createConfig('hash', 'sha512.js', 'sha512', 'hash.sha512'),
  ...createConfig('node', 'events.js', 'events', 'node.events'),
  ...createConfig('node', 'path.js', 'path', 'node.path'),
  ...createConfig('node', 'querystring.js', 'querystring', 'node.querystring'),
  ...createConfig('node', 'timers.js', 'timers', 'node.timers'),
  ...createConfig('node', 'url.js', 'url', 'node.url'),
  ...createConfig('node', 'util.js', 'util', 'node.util'),
  ...createConfig('path'),
  ...createConfig('testing', 'asserts.js', 'asserts', 'testing.asserts'),
  ...createConfig('testing', 'bench.js', 'bench', 'testing.bench'),
  ...createConfig('testing', 'diff.js', 'diff', 'testing.diff'),
  ...createConfig('uuid'),
  ...([
    getRollupConfig({
      entry: `dist/esm/index.js`,
      output: `denostd`,
      ns: `denostd`,
      minify: false
    }),
    getRollupConfig({
      entry: `dist/esm/index.js`,
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
  extractApi('fmt', 'printf', 'fmt')
  extractApi('hash', 'fnv', 'fnv', 'hash.fnv')
  extractApi('hash', 'md5', 'md5', 'hash.md5')
  extractApi('hash', 'sha1', 'sha1', 'hash.sha1')
  extractApi('hash', 'sha256', 'sha256', 'hash.sha256')
  extractApi('hash', 'sha512', 'sha512', 'hash.sha512')
  extractApi('node', 'events', 'events', 'node.events')

  // just copy std/path
  // extractApi('node', 'path', 'path', 'node.path')

  extractApi('node', 'querystring', 'querystring', 'node.querystring')
  extractApi('node', 'timers', 'timers', 'node.timers')
  extractApi('node', 'url', 'url', 'node.url')

  const dtspath = getPath('dist/esm/std/node/util.d.ts')
  const utildts = readFileSync(dtspath, 'utf8')
  let newCode = utildts.replace(/import\("\.\/_utils"\)\._Text(\S{2})coder/g, 'typeof globalThis.Text$1coder.prototype')
  writeFileSync(dtspath, newCode, 'utf8')
  try {
    extractApi('node', 'util', 'util', 'node.util')
  } catch (err) {
    writeFileSync(dtspath, utildts, 'utf8')
    throw err
  }
  writeFileSync(dtspath, utildts, 'utf8')

  extractApi('path')
  const dest = getPath('dist/browser/node/path.d.ts')
  copyFileSync(getPath('dist/browser/path/path.d.ts'), dest)
  const code = readFileSync(dest, 'utf8').split(/\r?\n/)
  code.splice(1, 0, 'export namespace node {')
  code.push('}')
  writeFileSync(dest, code.join(EOL), 'utf8')

  extractApi('testing', 'asserts', 'asserts', 'testing.asserts')
  extractApi('testing', 'bench', 'bench', 'testing.bench')
  extractApi('testing', 'diff', 'diff', 'testing.diff')
  extractApi('uuid')
}

function compileForRollup (tsEntries) {
  for (let i = 0; i < tsEntries.length; i++) {
    compile(getPath('tsconfig.esm.json'), tsEntries[i])
  }
}

async function main () {
  await srcUtil.changeSource(list)
  try {
    console.log('Output cjs ...')
    compile(getPath('tsconfig.json'))
    console.log('Output esm ...')
    compile(getPath('tsconfig.esm.json'))
    console.log('Overwrite async ...')
    compileForRollup(tsEntries)
  } catch (err) {
    await srcUtil.restoreSource(list)
    throw err
  }
  await srcUtil.restoreSource(list)

  console.log('Output browser code ...')
  await bundle(browserlist)
  console.log('Output .d.ts ...')
  extractApis()
  // extractEntryApi()
}

main().catch(err => console.log(err))
