const { compile } = require('./ts.js')
const srcUtil = require('./src.js')
const { join } = require('path')

const list = require('./list.js')

srcUtil.changeSource(list)
try {
  compile(join(__dirname, '../tsconfig.json'))
  compile(join(__dirname, '../tsconfig.esm.json'))
} catch (err) {
  console.log(err)
}
srcUtil.restoreSource(list)
