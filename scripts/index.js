const { compile } = require('./ts.js')
const srcUtil = require('./src.js')
const { getPath } = require('./path.js')
const { bundle, createConfig } = require('./rollup.js')

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
]

async function main () {
  await srcUtil.changeSource(list)
  try {
    console.log('Output cjs ...')
    compile(getPath('tsconfig.json'))
    console.log('Output esm ...')
    compile(getPath('tsconfig.esm.json'))
    console.log('Output umd ...')
    await bundle(umdList)
  } catch (err) {
    console.log(err)
  }
  await srcUtil.restoreSource(list)
}

main().catch(err => console.log(err))
