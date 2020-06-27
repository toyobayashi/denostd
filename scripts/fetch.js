const fetch = require('node-fetch').default
const path = require('path')
/** @type {typeof import('fs-extra')} */
const fs = require('fs-extra')

const { unzipSync } = require('@tybys/cross-zip')

;(async function main (args) {
  const version = args[0]
  if (version === undefined) {
    throw new Error('Version required.')
  }
  
  const res = await fetch(`https://github.com/denoland/deno/archive/std/${version}.zip`, {
    method: 'GET',
    headers: {
      'User-Agent': 'denostd'
    }
  })

  let size = -1
  if (res.headers.has('content-length')) {
    size = Number(res.headers.has('content-length'))
  }

  let l = 0
  res.body.on('data', (chunk) => {
    l += chunk.length
    if (size !== -1) {
      const percent = l / size
      process.stdout.write(`\x1b[666D\x1b[0KDownload ${version}.zip: ${l} / ${size} ${(Math.floor(percent * 10000) / 100).toFixed(2)}%`)
    } else {
      process.stdout.write(`\x1b[666D\x1b[0KDownload ${version}.zip: ${l} / Unknown`)
    }
  })

  res.body.on('error', (err) => {
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
    unzipSync(target, join(__dirname, `../temp/${version}`))
    fs.removeSync(join(__dirname, `../cli/js`))
    fs.copySync(join(__dirname, `../temp/${version}/cli/js`), join(__dirname, `../cli/js`))
    fs.removeSync(join(__dirname, `../std`))
    fs.copySync(join(__dirname, `../temp/${version}/std`), join(__dirname, `../std`))
    fs.removeSync(tmpDir)
  })
  res.body.pipe(dest)
})(process.argv.slice(2)).catch(err => {
  console.error(err)
  process.exit(1)
})
