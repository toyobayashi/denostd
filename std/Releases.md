### 0.91.0 / 2021.03.21

- chore(codecov): ignore coverage of examples (#798)
- feat(encoding/yaml): add support for JS types and user types (#789)
- feat(io/streams): Add readerFromIterable() (#752)
- feat(std/node): add utimes and utimesSync (#805)
- fix(multipart): support useDefineForClassFields (#807)
- fix(node): fix node/cli.ts (#797)
- fix(node): move `throw error` in fs.writeFile to pass `no-unsafe-finally`
  (#810)
- fix(path): enable and fix file URL tests (#804)
- refactor(node/fs): update fs import (#793)

### 0.90.0 / 2021.03.09

- fix(http): Create a single encoder instance (#790)
- feat(node): Add "module" polyfill (#783)
- feat(node): Add CLI for running Node.js script with std/node (#779)
- feat(node): Fix assert module, enable test cases (#769)

### 0.89.0 / 2021.03.02

- BREAKING(io/streams): Strengthen iterator to readable stream conversion (#735)
- build: collect and upload code coverage (#770)
- feat(node): add constants module (#747)
- feat(node): add crypto.createHash (#757)
- feat(node): add process.hrtime function (#751)
- feat(node): add truncate and truncateSync (#765)
- fix(node): export promisify & callbackify (#748)
- fix(node): fix export items of events (#758)
- fix(node): ignore shebang (#746)
- fix(node): native module needs to be extensible (#745)
- fix(node/process): make process.argv an array (#749)
- fix: fix type errors in canary test (#762)
- refactor: fix codes to pass `no-unused-vars` lint (#764)
- test(path): update test cases for canary (#775)

### 0.88.0 / 2021.02.19

- BREAKING(encoding): remove module utf8.ts (#728)
- chore: fix typo in contributing section (#709)
- docs(bytes): improve README.md (#737)
- feat(node): add native module polyfills: url, crypto (#729)
- feat(node): add tty module (#738)
- feat(node): support conditional exports (#726)
- fix(std/testing) : Handle Symbols correctly in deep equalities (#731)
- test(node): run external tests with --quiet (#732)

### 0.87.0 / 2021.02.12

- BREAKING(http/cookie): remove Cookies and SameSite type aliases (#720)
- docs(fmt): fix examples in fmt/colors.ts (#715)
- docs(io/ioutil): improve jsdoc (#706)
- fix(http/file_server): svg media type (#718)
- refactor(hash/md5): throw `TypeError` for wrong type (#698)
- test(node): enable native node tests (#695)

### 0.86.0 / 2021.02.05

- feat(http/file_server): support do not show dotfiles (#690)
- feat(http/file_server): show ../ if it makes sense & end dirs with / (#691)

Releases notes for previous releases can be found in
[`deno` repository](https://github.com/denoland/deno/releases).
