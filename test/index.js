const { hash, node } = require("../dist/cjs/index.js")
const md5 = new hash.md5.Md5()
const buffer = node.buffer.Buffer.from(md5.digest())
console.log(buffer.toString('hex'))
