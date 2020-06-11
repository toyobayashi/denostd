const { compile } = require('./ts.js')
const srcUtil = require('./src.js')
const { getPath } = require('./path.js')
const { bundle, createConfig, getRollupConfig } = require('./rollup.js')
const { extractApi } = require('./apiex.js')

const list = require('./list.js')

const umdList = [
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

  // extractApi('node', 'path', 'path', 'node.path')

  extractApi('node', 'querystring', 'querystring', 'node.querystring')
  extractApi('node', 'timers', 'timers', 'node.timers')
  extractApi('node', 'url', 'url', 'node.url')

  // extractApi('node', 'util', 'util', 'node.util')

  // Internal Error: getResolvedModule() could not resolve module name "./_interface"
  // extractApi('path')

  extractApi('testing', 'asserts', 'asserts', 'testing.asserts')
  extractApi('testing', 'bench', 'bench', 'testing.bench')
  extractApi('testing', 'diff', 'diff', 'testing.diff')
  extractApi('uuid')
}

async function main () {
  await srcUtil.changeSource(list)
  try {
    console.log('Output cjs ...')
    compile(getPath('tsconfig.json'))
    console.log('Output esm ...')
    compile(getPath('tsconfig.esm.json'))
  } catch (err) {
    console.log(err)
  }
  await srcUtil.restoreSource(list)

  console.log('Output umd ...')
  await bundle(umdList)
  console.log('Output umd .d.ts ...')
  extractApis()
}

main().catch(err => console.log(err))
