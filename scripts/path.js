const { isAbsolute, join } = require('path')
const { findPrefixSync } = require('@tybys/find-npm-prefix')
const context = findPrefixSync(process.cwd())

function getPath (...args) {
  if (!args.length) return context
  return isAbsolute(args[0]) ? join(...args) : join(context, ...args)
}

exports.getPath = getPath
