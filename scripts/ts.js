const { dirname, basename, extname, join } = require('path')
const { existsSync } = require('fs')
const { builtinModules } = require('module')
const { getPath } = require('./path.js')

const ts = require('typescript')

class TSError extends Error {
  constructor (msg, code) {
    super(msg)
    this.code = code
  }

  what () {
    return `TS${this.code}: ${this.message}`
  }
}

function compile (tsconfig, opts) {
  const parseConfigHost = {
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    useCaseSensitiveFileNames: true
  }
  
  const configFileName = ts.findConfigFile(
    dirname(tsconfig),
    ts.sys.fileExists,
    basename(tsconfig)
  )
  if (!configFileName) {
    throw new Error(`TSConfig not found: ${tsconfig}`)
  }
  const configFile = ts.readConfigFile(configFileName, ts.sys.readFile)
  const compilerOptions = ts.parseJsonConfigFileContent(
    configFile.config,
    parseConfigHost,
    dirname(tsconfig)
  )

  if (opts !== undefined) {
    compilerOptions.options = {
      ...compilerOptions.options,
      ...opts.compilerOptions
    }
    compilerOptions.fileNames = [
      getPath('polyfill/api.d.ts'),
      getPath(opts.entry)
    ]
  }

  if (compilerOptions.errors.length) {
    throw new TSError(compilerOptions.errors[0].messageText, compilerOptions.errors[0].code)
  }

  const compilerHost = ts.createCompilerHost(compilerOptions.options)

  const oldWriteFile = compilerHost.writeFile
  compilerHost.writeFile = function (fileName, data, writeByteOrderMark, onError, sourceFiles) {
    // console.log(fileName)
    let newData = data.replace(/((import|export)\s+.+?\s+from\s+)['"](.+)\.tsx?['"]/g, '$1"$3"')
      .replace(/(import\s+)['"](.+)\.tsx?['"]/g, '$1"$2"')
      .replace(/import\(['"](.+)\.tsx?['"]\)/g, 'import("$1")')
      .replace(/require\(['"](.+)\.tsx?['"]\)/g, 'require("$1")')
    // if (!compilerOptions.options.module || compilerOptions.options.module === ts.ModuleKind.CommonJS) {

    // } else if (compilerOptions.options.module >= ts.ModuleKind.ES2015) {

    // }
    return oldWriteFile.call(this, fileName, newData, writeByteOrderMark, onError, sourceFiles)
  }

  compilerHost.resolveModuleNames = function (moduleNames, containingFile/* , reusedNames, redirectedReference, options */) {

    const tryExt = ['.ts', '.tsx', '.d.ts', '.json', '.js', '.jsx']
    return moduleNames.map((request, index) => {
      const ext = extname(request)
      if (request[0] !== '.') {
        if (builtinModules.includes(request)) {
          return {
            resolvedFileName: getPath('node_modules/@types/node', request + '.d.ts'),
            isExternalLibraryImport: true
          }
        } else if (existsSync(getPath('node_modules/@types', request))) {
          return {
            resolvedFileName: getPath('node_modules/@types', request, 'index.d.ts'),
            isExternalLibraryImport: true
          }
        } else if (request === 'tslib') {
          return {
            resolvedFileName: getPath('node_modules', request, 'tslib.d.ts'),
            isExternalLibraryImport: true
          }
        }
        throw new Error('Not support node_modules: ' + request)
      }

      const targetPath = join(dirname(containingFile), request)

      if ((['.ts', '.tsx']).includes(ext)) {
        return {
          resolvedFileName: targetPath,
          isExternalLibraryImport: false
        }
      }

      if (ext === '') {
        for (let i = 0; i < tryExt.length; i++) {
          const p = targetPath + tryExt[i]
          if (existsSync(p)) {
            return {
              resolvedFileName: p,
              isExternalLibraryImport: false
            }
          }
        }
      }
      
      throw new Error(`Cannot find module: "${request}" in ${containingFile}`)
    })
  }

  let program = ts.createProgram(compilerOptions.fileNames, compilerOptions.options, compilerHost)
  let emitResult = program.emit()

  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`)
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"))
    }
  })

  if (emitResult.emitSkipped) {
    throw new Error('TypeScript compile failed.')
  }
}

exports.compile = compile
