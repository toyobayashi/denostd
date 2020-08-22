const { getPath } = require('./path.js')

// const inputPrefix = 'dist/_esm'
const inputPrefix = 'dist/esm'
const outputPrefix = getPath('dist/umd')

/**
 * @param {{ entry: string; output: string; ns: string; minify?: boolean; terserOptions?: import('rollup-plugin-terser').Options }} opts 
 */
function getRollupConfig (opts) {
  const { entry, output, ns, minify, terserOptions } = opts

  const rollupTerser = require('rollup-plugin-terser').terser
  // const { nativeRequireRollupPlugin } = require('@tybys/native-require/plugins/rollup')
  // const rollupTypescript = require('@rollup/plugin-typescript')
  const rollupJSON = require('@rollup/plugin-json')
  // const rollupCommonJS = require('@rollup/plugin-commonjs')
  // const rollupReplace = require('@rollup/plugin-replace')
  const rollupNodeResolve = require('@rollup/plugin-node-resolve').default
  // const rollupBabel = require('@rollup/plugin-babel').default
  const rollupInject = require('@rollup/plugin-inject')

  const outputFilename = minify ? getPath(outputPrefix, `${output}.min.js`) : getPath(outputPrefix, `${output}.js`)
  const format = 'umd'
  return {
    input: {
      input: getPath(entry),
      plugins: [
        // nativeRequireRollupPlugin(),
        rollupNodeResolve(),
        // rollupTypescript({
        //   tsconfig: getPath('tsconfig.prod.json')
        // }),
        rollupJSON(),

        // https://github.com/microsoft/TypeScript/issues/36841#issuecomment-669014853
        rollupInject({
          '__classPrivateFieldGet': ['tslib', '__classPrivateFieldGet'],
          '__classPrivateFieldSet': ['tslib', '__classPrivateFieldSet'],
        }),

        // rollupReplace({
        //   'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        // }),
        /* rollupCommonJS({
          extensions: ['.js', 'jsx', '.ts', '.tsx']
        }), */
        // rollupBabel({
        //   babelHelpers: 'bundled'
        // }),
        ...(minify ? [rollupTerser({
          output: {
            comments: false,
            beautify: false
          },
          ...(terserOptions || {}),
          module: (terserOptions && terserOptions.module) || (['es', 'esm', 'module']).includes(format)
        })] : [])
      ],
      context: 'this',
      onwarn(warning, warn) {
        // suppress eval warnings
        if (warning.code === 'EVAL') return
        warn(warning)
      }
    },
    output: {
      file: outputFilename,
      format: format,
      name: ns,
      exports: 'named'
    }
  }
}

/**
 * @param {object[]} configList
 * @param {boolean} replaceESModule
 * @returns {Promise<void>}
 */
async function bundle (configList, replaceESModule) {
  const rollup = require('rollup').rollup

  const indexEntry = getPath(inputPrefix, 'index.js')

  const denostdPlugin = {
    name: 'denostd',
    renderChunk (code , chunk, options) {
      if (chunk.facadeModuleId === indexEntry) {
        code = code.replace(/(exports|\S{1})\.VERSION(\s*=)\s*(\S+?)(;|,)/g, 'Object.defineProperty($1,"VERSION",{value:$3})$4')
      }
      code = code.replace(/this\.denostd/g, 'window.denostd')
        .replace(/var denostd(\s*=)/g, 'window.denostd$1')
      
      if (replaceESModule) {
        code = code.replace(/(.\s*)?Object\.defineProperty\s*\(\s*(exports|\S{1})\s*,\s*(['"])__esModule['"]\s*,\s*\{\s*value\s*:\s*(.*?)\s*\}\s*\)\s*;?/g, (_match, token, exp, quote, value) => {
          const iifeTemplate = (content, replaceVar) => {
            if (replaceVar != null && replaceVar !== '') {
              return `(function(${replaceVar}){${content.replace(new RegExp(exp, 'g'), replaceVar)}})(${exp})`
            }
            return `(function(){${content}})()`
          }
          const content = (iife) => {
            return `try{${iife ? 'return ' : ''}Object.defineProperty(${exp},${quote}__esModule${quote},{value:${value}})}catch(_){${iife ? 'return ' : ''}${exp}.__esModule=${value}${iife ? (',' + exp) : ''}}`
          }
          const _token = token === undefined ? undefined : token.trim()
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (!_token) return content(false)
          if (_token === '{' || _token === ';') {
            return `${token}${content(false)}`
          } else if (_token === ')' || /^[a-zA-Z$_][a-zA-Z\d_]*$/.test(_token)) {
            return `${token};${content(false)}`
          } else {
            return `${token}${iifeTemplate(content(true), exp === 'this' ? 'e' : '')}`
          }
        })
        code = code.replace(/exports\.default/g, 'exports[\'default\']')
      }

      return code
    }
  }

  await Promise.all(configList.map(conf => {
    conf.input.plugins.push(denostdPlugin)
    return rollup(conf.input).then(bundle => bundle.write(conf.output))
  }))
}

function createConfig (mod, entry, out, ns) {
  const prefix = `${inputPrefix}/std`
  return [
    getRollupConfig({
      entry: `${prefix}/${mod}/${entry || 'mod.js'}`,
      output: `${mod}/${out || mod}`,
      ns: `denostd.${ns || mod}`,
      minify: false
    }),
    getRollupConfig({
      entry: `${prefix}/${mod}/${entry || 'mod.js'}`,
      output: `${mod}/${out || mod}`,
      ns: `denostd.${ns || mod}`,
      minify: true
    })
  ]
}

exports.getRollupConfig = getRollupConfig
exports.bundle = bundle
exports.createConfig = createConfig
exports.inputPrefix = inputPrefix
exports.outputPrefix = outputPrefix
