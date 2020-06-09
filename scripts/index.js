const { compile } = require('./ts.js')
const srcUtil = require('./src.js')
const { join } = require('path')

const list = require('./list.js')

srcUtil.changeSource(list)
compile(join(__dirname, '../tsconfig.json'))
compile(join(__dirname, '../tsconfig.esm.json'))
srcUtil.restoreSource(list)
