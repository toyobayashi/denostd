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
$ npm run build # output dist folder
```

### Browser

Full version:

``` html
<script src="node_modules/@tybys/denostd/dist/browser/denostd.min.js"></script>
<script>
console.log(denostd);
denostd.fmt.printf('%s', 'yo');
</script>
```

Standalone:

``` html
<script src="node_modules/@tybys/denostd/dist/browser/fmt/fmt.min.js"></script>
<script src="node_modules/@tybys/denostd/dist/browser/node/events.min.js"></script>
<script src="node_modules/@tybys/denostd/dist/browser/node/path.min.js"></script>
<script>
console.log(denostd.fmt);
console.log(denostd.node);
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

* fmt

* hash

* node

    * events

    * path

    * querystring

    * timers

    * url

    * util

* path

* testing

* uuid
