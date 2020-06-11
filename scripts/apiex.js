const { getPath } = require('./path.js')
const fs = require('fs')

const {
  Extractor,
  ExtractorConfig
} = require('@microsoft/api-extractor')

const dtsHack = require('./dts.js')

function invokeApiExtractor (entry, output) {
  const apiExtractorJsonPath = getPath('api-extractor.json')

  let extractorConfig
  if (false) {
    extractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath)
  } else {
    const configObjectFullPath = apiExtractorJsonPath /* path.join(__dirname, '../tsconfig/api-extractor.json') */
    const packageJsonFullPath = getPath('package.json')
    const configObject = ExtractorConfig.loadFile(configObjectFullPath)
    // configObject.projectFolder = getPath()
    configObject.mainEntryPointFilePath = entry
    configObject.dtsRollup.untrimmedFilePath = output
    extractorConfig = ExtractorConfig.prepare({
      configObject,
      configObjectFullPath: apiExtractorJsonPath, // fake path
      packageJson: JSON.parse(fs.readFileSync(packageJsonFullPath, 'utf8')),
      packageJsonFullPath: packageJsonFullPath
    })
  }

  const extractorResult = Extractor.invoke(extractorConfig, {
    // Equivalent to the "--local" command-line parameter
    localBuild: true,

    // Equivalent to the "--verbose" command-line parameter
    showVerboseMessages: true
  })

  if (!extractorResult.succeeded) {
    throw new Error(`API Extractor completed with ${extractorResult.errorCount} errors`
      + ` and ${extractorResult.warningCount} warnings`)
  }
}

function extractApi (mod, entry, out, ns) {
  const prefix = 'dist/esm/std'
  const dtsPath = getPath('dist/browser', mod, (out || mod) + '.d.ts')
  let info = dtsHack.applyChange(getPath(prefix, mod))
  try {
    invokeApiExtractor(getPath(prefix, mod, (entry || 'mod') + '.d.ts'), dtsPath)
  } catch (err) {
    dtsHack.revertChange(info)
    throw err
  }
  dtsHack.revertChange(info)
  dtsHack.resolveDeclarationFile(dtsPath, ns || mod, 'iife')
}

exports.invokeApiExtractor = invokeApiExtractor
exports.extractApi = extractApi
