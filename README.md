# denostd

[Deno standard library](https://deno.land/std) porting for browser and Node.js

## Usage

### Install

With npm:

``` bash
$ npm install @tybys/denostd
```

Build from source:

``` bash
$ npm run build
```

Output:

* `dist/cjs` - Module: `CommonJS`, Target: `ES2019`

* `dist/esm` - Module: `ESNext`, Target: `ES2019`

* `dist/browser` - Module: `UMD`, Target: `ES5` but need polyfills for `Promise`, `Symbol`, `WeakMap`, `TypedArray`, `globalThis`, etc in old browser

### Browser

Full version:

``` html
<script src="https://cdn.jsdelivr.net/npm/@tybys/denostd/dist/browser/denostd.min.js"></script>
<script>
console.log(denostd);
denostd.fmt.printf('%s', 'yo');
</script>
```

Standalone:

``` html
<script src="https://cdn.jsdelivr.net/npm/@tybys/denostd/dist/browser/fmt/fmt.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tybys/denostd/dist/browser/node/buffer.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tybys/denostd/dist/browser/node/events.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tybys/denostd/dist/browser/node/path.min.js"></script>
<script>
console.log(denostd.fmt);
console.log(denostd.node);
console.log(Buffer);
</script>
```

### Node.js

Full version:

``` js
const denostd = require('@tybys/denostd')
denostd.fmt.printf('%s', 'yo')
```

Standalone:

``` js
const fmt = require('@tybys/denostd/dist/cjs/std/fmt/printf.js')
fmt.printf('%s', 'yo')
```

### Webpack

Configuration:

``` js
module.exports = {
  // ...
  node: false // avoid bundling node polyfill
}
```

Full version:

``` js
import * as denostd from '@tybys/denostd'
```

Standalone:

``` js
import * as path from '@tybys/denostd/dist/esm/std/path/mod.js'
```

### TypeScript

Full version:

``` js
import * as denostd from '@tybys/denostd'
```

Standalone:

``` js
import * as path from '@tybys/denostd/dist/esm/std/path/mod'
```

## Available modules:

* async

* bytes

* datetime

* encoding

    * base32
    
    * base64
    
    * base64url
    
    * hex
    
    * toml
    
    * utf8

* fmt

    * print

* hash

    * fnv

    * md5

    * sha1

    * sha3

    * sha256

    * sha512

* node

    * buffer

    * events

    * path (the same as `std/path`)

    * querystring

    * timers

    * url

    * util

* path

* testing

    * asserts

    * bench

    * diff

* uuid
