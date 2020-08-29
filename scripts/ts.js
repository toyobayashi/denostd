const { dirname, basename, extname, join, relative, sep } = require('path')
const { existsSync } = require('fs')
const { builtinModules } = require('module')
const { getPath } = require('./path.js')

const ts = require('typescript')
// fix typescript < 4.0
ts.classPrivateFieldGetHelper.importName = ts.classPrivateFieldGetHelper.importName || '__classPrivateFieldGet'
ts.classPrivateFieldSetHelper.importName = ts.classPrivateFieldSetHelper.importName || '__classPrivateFieldSet'

class TSError extends Error {
  constructor (msg, code) {
    super(msg)
    this.code = code
  }

  what () {
    return `TS${this.code}: ${this.message}`
  }
}

function compile (tsconfig, opts = {}) {
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

  if (opts.compilerOptions) {
    compilerOptions.options = {
      ...compilerOptions.options,
      ...opts.compilerOptions || {}
    }
  }
  if (opts.entry) {
    compilerOptions.fileNames = [
      getPath('polyfill/api.d.ts'),
      getPath(opts.entry)
    ]
  }

  const suffix = opts.removeSuffix !== true

  if (compilerOptions.errors.length) {
    throw new TSError(compilerOptions.errors[0].messageText, compilerOptions.errors[0].code)
  }

  const compilerHost = ts.createCompilerHost(compilerOptions.options)
  // ts.externalHelpersModuleNameText
  /* const oldWriteFile = compilerHost.writeFile
  compilerHost.writeFile = function (fileName, data, writeByteOrderMark, onError, sourceFiles) {
    let moduleRequest = relative(dirname(fileName.replace(/\//g, sep)), join(compilerOptions.options.outDir, 'polyfill/tslib')).replace(/\\/g, '/')
    if (moduleRequest.charAt(0) !== '.') {
      moduleRequest = `./${moduleRequest}`
    }
    let newData
    if (suffix && !fileName.endsWith('.d.ts')) {
      newData = data
        // .replace(/((import|export)\s+.+?\s+from\s+)['"]tslib['"]/g, `$1"${moduleRequest}.js"`)
        // .replace(/require\(['"]tslib['"]\)/g, `require("${moduleRequest}.js")`)
        // .replace(/((import|export)\s+.+?\s+from\s+)['"](.+)\.t(sx?)['"]/g, '$1"$3.j$4"')
        // .replace(/(import\s+)['"](.+)\.t(sx?)['"]/g, '$1"$2.j$3"')
        // .replace(/import\(['"](.+)\.t(sx?)['"]\)/g, 'import("$1.j$2")')
        // .replace(/require\(['"](.+)\.t(sx?)['"]\)/g, 'require("$1.j$2")')
    } else {
      newData = data
        // .replace(/((import|export)\s+.+?\s+from\s+)['"]tslib['"]/g, `$1"${moduleRequest}"`)
        // .replace(/require\(['"]tslib['"]\)/g, `require("${moduleRequest}")`)
        // .replace(/((import|export)\s+.+?\s+from\s+)['"](.+)\.tsx?['"]/g, '$1"$3"')
        // .replace(/(import\s+)['"](.+)\.tsx?['"]/g, '$1"$2"')
        // .replace(/import\(['"](.+)\.tsx?['"]\)/g, 'import("$1")')
        // .replace(/require\(['"](.+)\.tsx?['"]\)/g, 'require("$1")')
    }

    // if (!compilerOptions.options.module || compilerOptions.options.module === ts.ModuleKind.CommonJS) {

    // } else if (compilerOptions.options.module >= ts.ModuleKind.ES2015) {

    // }
    return oldWriteFile.call(this, fileName, newData, writeByteOrderMark, onError, sourceFiles)
  } */

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
  let emitResult = program.emit(undefined, undefined, undefined, false, {
    after: [createTransformer(false, suffix, compilerOptions)],
    afterDeclarations: [createTransformer(true, suffix, compilerOptions)]
  })

  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)

  const ignoreErrors = [
    2354, // This syntax requires an imported helper but module '{0}' cannot be found.
    18028 // Private identifiers are only available when targeting ECMAScript 2015 and higher.
  ]

  const diagnostics = allDiagnostics.filter(d => !ignoreErrors.includes(d.code))
  if (diagnostics.length) {
    const host = {
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getCanonicalFileName: createGetCanonicalFileName(true),
      getNewLine: function () { return ts.sys.newLine }
    }
    console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, host))
  }

  if (emitResult.emitSkipped) {
    throw new Error('TypeScript compile failed.')
  }
}

exports.compile = compile

function identity (x) { return x }

function toLowerCase (x) { return x.toLowerCase() }

const fileNameLowerCaseRegExp = /[^\u0130\u0131\u00DFa-z0-9\\/:\-_\. ]+/g

function toFileNameLowerCase (x) {
  return fileNameLowerCaseRegExp.test(x)
    ? x.replace(fileNameLowerCaseRegExp, toLowerCase)
    : x
}

function createGetCanonicalFileName (useCaseSensitiveFileNames) {
  return useCaseSensitiveFileNames ? identity : toFileNameLowerCase
}

function createTransformer (isDeclarationFile, suffix) {
  let currentSourceFile = ''
  return (
    /** @type {import('typescript').TransformationContext} */
    context
  ) => {
    /** @type {import('typescript').Visitor} */
    const visitor = (node) => {
      if (ts.isSourceFile(node)) {
        currentSourceFile = node.fileName
        return ts.visitEachChild(node, visitor, context)
      }

      if (ts.isImportDeclaration(node)) {
        return context.factory.createImportDeclaration(node.decorators, node.modifiers, node.importClause, replaceModuleSpecifier(node.moduleSpecifier, context, isDeclarationFile, currentSourceFile, suffix))
      }

      if (ts.isImportEqualsDeclaration(node)) {
        return context.factory.createImportEqualsDeclaration(node.decorators, node.modifiers, node.name, context.factory.createExternalModuleReference(replaceModuleSpecifier(node.moduleReference.expression, context, isDeclarationFile, currentSourceFile, suffix)))
      }

      if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        return context.factory.createExportDeclaration(node.decorators, node.modifiers, node.isTypeOnly, node.exportClause, replaceModuleSpecifier(node.moduleSpecifier, context, isDeclarationFile, currentSourceFile, suffix))
      }

      if (ts.isCallExpression(node)
        && node.expression
        && ((ts.isIdentifier(node.expression) && node.expression.escapedText === 'require') || node.expression.kind === ts.SyntaxKind.ImportKeyword)
        && node.arguments.length === 1
        && ts.isStringLiteral(node.arguments[0])
      ) {
        return context.factory.createCallExpression(node.expression, node.typeArguments, [replaceModuleSpecifier(node.arguments[0], context, isDeclarationFile, currentSourceFile, suffix)])
      }

      if (ts.isImportTypeNode(node)) {
        return context.factory.createImportTypeNode(
          context.factory.createLiteralTypeNode(replaceModuleSpecifier(node.argument.literal, context, isDeclarationFile, currentSourceFile, suffix)),
          node.qualifier,
          node.typeArguments,
          node.isTypeOf
        )
      }

      return ts.visitEachChild(node, visitor, context)
    }
    return (node) => ts.visitNode(node, visitor)
  }
}

/**
 * @param {import('typescript').StringLiteral} node 
 * @param {import('typescript').TransformationContext} context 
 * @param {boolean} isDeclarationFile 
 * @param {string} currentSourceFile 
 * @param {boolean} suffix 
 * @returns {import('typescript').StringLiteral}
 */
function replaceModuleSpecifier (node, context, isDeclarationFile, currentSourceFile, suffix) {
  if (node.text === 'tslib') {
    const fileName = currentSourceFile
    let moduleRequest = relative(dirname(fileName.replace(/\//g, sep)), getPath('polyfill/tslib')).replace(/\\/g, '/')
    if (moduleRequest.charAt(0) !== '.') {
      moduleRequest = `./${moduleRequest}`
    }
    return (!isDeclarationFile && suffix)
      ? context.factory.createStringLiteral(moduleRequest + '.js')
      : context.factory.createStringLiteral(moduleRequest)
  }
  if (node.text.charAt(0) !== '.') {
    return node
  }
  return (!isDeclarationFile && suffix)
    ? context.factory.createStringLiteral(removeSuffix(node.text) + '.js')
    : context.factory.createStringLiteral(removeSuffix(node.text))
}

function endsWith (str, suffix) {
  var expectedPos = str.length - suffix.length
  return expectedPos >= 0 && str.indexOf(suffix, expectedPos) === expectedPos
}

function removeSuffix (str, suffix) {
  if (suffix == null) {
    const dot = str.lastIndexOf('.')
    return dot !== -1 ? str.slice(0, dot) : str
  }
  return endsWith(str, suffix) ? str.slice(0, str.length - suffix.length) : str
}
