# denostd

[Deno standard library](https://deno.land/std) porting for browser and Node.js

## Usage

### Install

``` bash
$ npm install @tybys/denostd
```

Or repository and build from source:

``` bash
$ git clone https://github.com/toyobayashi/denostd.git
$ cd denostd
$ npm run build
```

Output:

* `dist/cjs` - Module: `CommonJS`, Target: `ES5`

* `dist/cjs-modern` - Module: `CommonJS`, Target: `ES2018` (Node.js environment default entry)

* `dist/esm` - Module: `ESNext`, Target: `ES5` (Webpack / Rollup default entry)

* `dist/esm-modern` - Module: `ESNext`, Target: `ES2018`

* `dist/umd` - Module: `UMD`, Target: `ES5`

Need polyfills for `Promise`, `Symbol`, `WeakMap`, `TypedArray`, `globalThis`, etc.

### Browser

Full version:

``` html
<script src="https://cdn.jsdelivr.net/npm/@tybys/denostd/dist/umd/denostd.min.js"></script>
<script>
console.log(denostd);
denostd.fmt.printf.printf('%s', 'yo');
</script>
```

Standalone:

``` html
<script src="https://cdn.jsdelivr.net/npm/@tybys/denostd/dist/umd/fmt/printf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tybys/denostd/dist/umd/async/async.min.js"></script>
<script>
console.log(denostd.fmt);
console.log(denostd.async);
</script>
```

ES Module:

``` html
<script type="module">
import { async } from "https://cdn.jsdelivr.net/npm/@tybys/denostd/dist/esm-modern/index.js";
const d = async.deferred();
console.log(d instanceof Promise);
</script>
```

### Node.js

Full version:

``` js
const denostd = require('@tybys/denostd')
denostd.fmt.printf.printf('%s', 'yo')
```

Standalone:

``` js
const printf = require('@tybys/denostd/dist/cjs-modern/std/fmt/printf.js')
printf.printf('%s', 'yo')
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
* collections
* datetime
* encoding
    * ascii85
    * base32
    * base64
    * base64url
    * hex
    * toml
* flags
* fmt
    * bytes
    * colors
    * printf
* hash
    * fnv
    * md5
    * sha1
    * sha3
    * sha256
    * sha512
* path
* testing
    * asserts
    * bench
* uuid
