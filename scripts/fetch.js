const path = require('path')
/** @type {typeof import('fs-extra')} */
const fs = require('fs-extra')
const got = require('got').default
const { unzipSync } = require('@tybys/cross-zip')

;(async function main (args) {
  const version = args[0]
  if (version === undefined) {
    throw new Error('Version required.')
  }

  const stream = got.stream(`https://github.com/denoland/deno/archive/std/${version}.zip`, {
    headers: {
      'User-Agent': 'denostd'
    }
  })

  stream.on('downloadProgress', (progress) => {
    const l = progress.transferred
    const percent = progress.percent
    if (progress.total != null) {
      process.stdout.write(`\x1b[666D\x1b[0KDownload ${version}.zip: ${l} / ${progress.total} ${(Math.floor(percent * 10000) / 100).toFixed(2)}%`)
    } else {
      process.stdout.write(`\x1b[666D\x1b[0KDownload ${version}.zip: ${l} / Unknown`)
    }
  })

  stream.on('error', (err) => {
    console.error(err)
    process.exit(1)
  })

  const tmpDir = path.join(__dirname, '../temp')
  await fs.remove(tmpDir)
  await fs.mkdirs(tmpDir)
  const target = path.join(__dirname, `../temp/${version}.zip`)
  const dest = fs.createWriteStream(target + '.tmp')
  dest.on('error', (err) => {
    console.error(err)
    process.exit(1)
  })
  dest.on('close', () => {
    console.log('\nDone.')
    fs.renameSync(target + '.tmp', target)
    unzipSync(target, path.join(__dirname, `../temp/${version}`))
    fs.removeSync(path.join(__dirname, `../cli/js`))
    fs.copySync(path.join(__dirname, `../temp/${version}/deno-std-${version}/cli/js`), path.join(__dirname, `../cli/js`))
    fs.removeSync(path.join(__dirname, `../std`))
    fs.copySync(path.join(__dirname, `../temp/${version}/deno-std-${version}/std`), path.join(__dirname, `../std`))
    fs.removeSync(tmpDir)
  })
  stream.pipe(dest)
})(process.argv.slice(2)).catch(err => {
  console.error(err)
  process.exit(1)
})
