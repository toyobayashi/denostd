const fs = require('fs')
const path = require('path')
const { EOL } = require('os')

function walk (dir, callback) {
  const ls = fs.readdirSync(dir)
  for (let i = 0; i < ls.length; i++) {
    const file = path.join(dir, ls[i])
    const namearr = path.basename(file).split('.')
    if (fs.statSync(file).isFile() && namearr.length === 3 && namearr[1] === 'd' && namearr[2] === 'ts') {
      callback(file)
    } else if (fs.statSync(file).isDirectory()) {
      walk(file, callback)
    }
  }
}

function collectInfo (outDir) {
  const info = {
    needWrap: {},
    users: {}
  }
  walk(outDir, (dtspath) => {
    const dirpath = path.dirname(dtspath)
    const code = fs.readFileSync(dtspath, 'utf8')
    const re = new RegExp('import \\* as (\\S+) from [\'"](\\.\\S*\\/\\S+)[\'"]', 'g')
    let arr = re.exec(code)
    while (arr !== null) {
      const targetDts = path.join(dirpath, arr[2] + '.d.ts')
      if (info.needWrap[targetDts] === undefined) {
        const targetDtsCode = fs.readFileSync(targetDts, 'utf8')
        info.needWrap[targetDts] = {
          ns: arr[1],
          code: targetDtsCode
        }
      }
      if (info.users[dtspath] === undefined) {
        info.users[dtspath] = { code }
      }
      arr = re.exec(code)
    }
  })
  return info
}

function applyChange (outDir) {
  const info = collectInfo(outDir)
  const { needWrap: dts, users: user } = info
  for (const key in dts) {
    const originalCode = dts[key].code /*  = readFileSync(key, 'utf8') */
    let lines = originalCode.split(/\r?\n/)
    let lineNumber = 0
    for (let i = 0; i < lines.length; i++) {
      if (/^(export|declare) /.test(lines[i].trimLeft())) {
        lineNumber = i
        break
      }
    }
    if (lineNumber !== 0) {
      for (let i = lineNumber; i >= 0; i--) {
        if (/^\/\*\*/.test(lines[i].trimLeft())) {
          lineNumber = i
          break
        }
      }
    }
    let code = dts[key].code.replace(/declare /g, '').replace(/export\s+\{\s*\};/g, '')
    if (code.includes('//# sourceMappingURL=')) {
      code = code.replace(/(\/\/# sourceMappingURL=(.*)(\r?\n)?)/g, `}${EOL}export default ${dts[key].ns};${EOL}$1${EOL}`)
    } else {
      code = code + `${EOL}}${EOL}export default ${dts[key].ns};`
    }
    lines = code.split(/\r?\n/)
    lines.splice(lineNumber, 0, `declare namespace ${dts[key].ns} {`)
    code = lines.join(EOL)
    fs.writeFileSync(key, code, 'utf8')
  }
  for (const key in user) {
    // user[key].code = readFileSync(key, 'utf8')
    let code = user[key].code
    for (const d in dts) {
      code = code.replace(new RegExp(`import \\* as (\\S+) from (['"]\\S+\\/${path.basename(d).split('.')[0]}['"])`, 'g'), 'import $1 from $2')
    }
    fs.writeFileSync(key, code, 'utf8')
  }
  return info
}

exports.applyChange = applyChange

function revertChange (info) {
  for (const key in info.needWrap) {
    fs.writeFileSync(key, info.needWrap[key].code, 'utf8')
  }
  for (const key in info.users) {
    fs.writeFileSync(key, info.users[key].code, 'utf8')
  }
}

exports.revertChange = revertChange

function resolveDeclarationFile (dtsPath, ns, format = 'umd') {
  const dts = fs.readFileSync(dtsPath, 'utf8')
  if (format === 'umd') {
    const umddts = `${dts}${EOL}export as namespace ${ns}${EOL}`
    fs.writeFileSync(dtsPath, umddts, 'utf8')
  } else if (format === 'cjs') {
    let cjsDts = dts.replace(/declare\s/g, '')
    cjsDts = cjsDts.replace(/export default (\S+);/g, 'export { $1 as default }')
    cjsDts = `declare namespace ${ns} {${EOL}${cjsDts}`
    cjsDts += `${EOL}}${EOL}export = ${ns}${EOL}`
    fs.writeFileSync(dtsPath, cjsDts, 'utf8')
  } else if (format === 'iife') {
    let globalDts = dts.replace(/declare\s/g, '')/* .replace(/export \{ \}/g, '') */
    globalDts = globalDts.replace(/export default (\S+);/g, 'export { $1 as default }')
    const prefix = ns.indexOf('.') === -1
      ? `declare namespace denostd {${EOL}export namespace ${ns} {${EOL}`
      : `declare namespace denostd {${EOL}export namespace ${ns.split('.')[0]} {${EOL}export namespace ${ns.split('.')[1]} {${EOL}`
    
    const suffix = ns.indexOf('.') === -1 ? `${EOL}}${EOL}}${EOL}` : `${EOL}}${EOL}}${EOL}}${EOL}`
    globalDts = `${prefix}${globalDts}${suffix}`
    fs.writeFileSync(dtsPath, globalDts, 'utf8')
  } else {
    throw new TypeError('Format: umd | cjs | iife')
  }
}

exports.resolveDeclarationFile = resolveDeclarationFile
