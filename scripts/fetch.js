const path = require('path')
/** @type {typeof import('fs-extra')} */
const fs = require('fs-extra')
const { Downloader } = require('@tybys/downloader')
const { unzipSync } = require('@tybys/cross-zip')

function download (url, name) {
  const d = Downloader.download(url, {
    dir: path.join(__dirname, '../temp'),
    out: name,
    headers: {
      'User-Agent': 'denostd'
    },
    ...(process.env.DENOPROXY ? {
      agent: {
        https: require('tunnel').httpsOverHttp({
          proxy: {
            host: 'localhost',
            port: 10809
          }
        })
      }
    } : {})
  })

  d.on('progress', (progress) => {
    const l = progress.completedLength
    const percent = progress.percent
    if (progress.totalLength > 0) {
      process.stderr.write(`\x1b[666D\x1b[0KDownload ${name}: ${l} / ${progress.totalLength} ${(Math.floor(percent * 100) / 100).toFixed(2)}%`)
    } else {
      process.stderr.write(`\x1b[666D\x1b[0KDownload ${name}: ${l} / Unknown`)
    }
  })

  return d.whenStopped().then(() => {
    return d.path
  })

  // return new Promise((resolve, reject) => {

  //   const stream = got.stream(url, {
  //     headers: {
  //       'User-Agent': 'denostd'
  //     },
  //     ...(process.env.DENOPROXY ? {
  //       agent: {
  //         https: require('tunnel').httpsOverHttp({
  //           proxy: {
  //             host: 'localhost',
  //             port: 10809
  //           }
  //         })
  //       }
  //     } : {})
  //   })

  //   stream.on('downloadProgress', (progress) => {
  //     const l = progress.transferred
  //     const percent = progress.percent
  //     if (progress.total != null) {
  //       process.stdout.write(`\x1b[666D\x1b[0KDownload ${name}: ${l} / ${progress.total} ${(Math.floor(percent * 10000) / 100).toFixed(2)}%`)
  //     } else {
  //       process.stdout.write(`\x1b[666D\x1b[0KDownload ${name}: ${l} / Unknown`)
  //     }
  //   })

  //   stream.on('error', (err) => {
  //     reject(err)
  //   })

  //   const target = path.join(__dirname, `../temp/${name}`)
  //   const dest = fs.createWriteStream(target + '.tmp')
  //   dest.on('error', (err) => {
  //     reject(err)
  //   })
  //   dest.on('close', () => {
  //     console.log('\nDone.')
  //     fs.renameSync(target + '.tmp', target)
  //     resolve(target)
  //   })
  //   stream.pipe(dest)
  // })
}

;(async function main (args) {
  const version = args[0]
  if (version === undefined) {
    throw new Error('Version required.')
  }
  const versionDeno = args[1]
  if (versionDeno === undefined) {
    throw new Error('Version required.')
  }

  const tmpDir = path.join(__dirname, '../temp')
  await fs.remove(tmpDir)
  await fs.mkdirs(tmpDir)
  let target = await download(`https://github.com/denoland/deno_std/archive/${version}.zip`, `${version}.zip`)
  unzipSync(target, path.join(__dirname, `../temp/${version}`))
  target = await download(`https://github.com/denoland/deno/archive/v${versionDeno}.zip`, `${versionDeno}.zip`)
  unzipSync(target, path.join(__dirname, `../temp/${versionDeno}`))

  fs.copySync(path.join(__dirname, `../temp/${versionDeno}/deno-${versionDeno}/runtime/js/01_errors.js`), path.join(__dirname, `../polyfill/error.ts`))
  fs.removeSync(path.join(__dirname, `../std`))
  fs.copySync(path.join(__dirname, `../temp/${version}/deno_std-${version}`), path.join(__dirname, `../std`))
  fs.removeSync(tmpDir)

})(process.argv.slice(2)).catch(err => {
  console.error(err)
  process.exit(1)
})
