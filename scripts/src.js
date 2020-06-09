const { readFileSync, copyFileSync, writeFileSync, unlinkSync, renameSync, existsSync } = require('fs')
const { join } = require('path')
const { EOL } = require('os')

function changeSource (changeList) {
  for (let i = 0; i < changeList.length; i++) {
    const item = changeList[i]
    const filepath = join(__dirname, '../std', item.path)
    if (!existsSync(filepath + '.copy')) {
      copyFileSync(filepath, filepath + '.copy')
    }
    const src = readFileSync(filepath, 'utf8')

    const lines = src.split(/\r?\n/)
    for (let x = 0; x < item.opts.length; x++) {
      if (item.opts[x].type === 'remove') {
        const targetLine = Array.isArray(item.opts[x].line) ? item.opts[x].line : [item.opts[x].line, item.opts[x].line + 1]
        lines.splice(targetLine[0], targetLine[1] - targetLine[0])
      } else if (item.opts[x].type === 'insert') {
        const valueLines = item.opts[x].value.split(/\r?\n/)
        lines.splice(item.opts[x].line, 0, ...valueLines)
      }
    }

    const newSrc = lines.join(EOL)
    writeFileSync(filepath, newSrc, 'utf8')
  }
}

function restoreSource (changeList) {
  for (let i = 0; i < changeList.length; i++) {
    const item = changeList[i]
    const filepathNew = join(__dirname, '../std', item.path)
    const filepath = filepathNew + '.copy'

    unlinkSync(filepathNew)
    renameSync(filepath, filepathNew)
  }
}

exports.changeSource = changeSource
exports.restoreSource = restoreSource
