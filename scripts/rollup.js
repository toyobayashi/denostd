const { getPath } = require('./path.js')

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
  const rollupReplace = require('@rollup/plugin-replace')
  // const rollupNodeResolve = require('@rollup/plugin-node-resolve').default
  const rollupBabel = require('@rollup/plugin-babel').default

  const outputFilename = minify ? getPath(outputPrefix, `${output}.min.js`) : getPath(outputPrefix, `${output}.js`)
  const format = 'umd'
  return {
    input: {
      input: getPath(entry),
      plugins: [
        // nativeRequireRollupPlugin(),
        // rollupNodeResolve(),
        // rollupTypescript({
        //   tsconfig: getPath('tsconfig.prod.json')
        // }),
        rollupJSON(),
        rollupReplace({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        /* rollupCommonJS({
          extensions: ['.js', 'jsx', '.ts', '.tsx']
        }), */
        rollupBabel({
          babelHelpers: 'bundled'
        }),
        ...(minify ? [rollupTerser({
          ...(terserOptions || {}),
          module: (terserOptions && terserOptions.module) || (['es', 'esm', 'module']).includes(format)
        })] : [])
      ],
      context: 'this'
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

  await Promise.all(configList.map(conf => rollup(conf.input).then(bundle => bundle.write(conf.output))))
  if (replaceESModule === true) {
    configList.forEach(conf => {
      let code = readFileSync(getPath(conf.output.file), 'utf8')
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
      writeFileSync(getPath(conf.output.file), code, 'utf8')
    })
  }
}

function createConfig (mod, entry, out, ns) {
  const prefix = 'dist/esm/std'
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
