# lowlight

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Virtual syntax highlighting for virtual DOMs and non-HTML things, with language
auto-detection.
Perfect for [React][], [VDOM][], and others.

Lowlight is built to work with all syntaxes supported by [highlight.js][],
that’s [188 languages][names] (and all 94 themes).

Want to use [Prism][] instead?
Try [`refractor`][refractor]!

## Contents

*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`lowlight.highlight(language, value[, options])`](#lowlighthighlightlanguage-value-options)
    *   [`lowlight.highlightAuto(value[, options])`](#lowlighthighlightautovalue-options)
    *   [`Result`](#result)
    *   [`lowlight.registerLanguage(language, syntax)`](#lowlightregisterlanguagelanguage-syntax)
    *   [`lowlight.registerAlias(language, alias)`](#lowlightregisteraliaslanguage-alias)
    *   [`lowlight.listLanguages()`](#lowlightlistlanguages)
*   [Browser](#browser)
*   [Related](#related)
*   [Projects](#projects)
*   [License](#license)

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install lowlight
```

[Usage in the browser »][browser]

## Use

Highlight:

```js
import {lowlight} from 'lowlight'

var tree = lowlight.highlight('js', '"use strict";').value

console.dir(tree, {depth: null})
```

Yields:

```js
[
  {
    type: 'element',
    tagName: 'span',
    properties: {className: ['hljs-meta']},
    children: [{type: 'text', value: '"use strict"'}]
  },
  {type: 'text', value: ';'}
]
```

hast trees can be serialized with [`hast-util-to-html`][to-html]:

```js
import {lowlight} from 'lowlight'
import toHtml from 'hast-util-to-html'

var tree = lowlight.highlight('js', '"use strict";').value

console.log(toHtml(tree))
```

Yields:

```html
<span class="hljs-meta">"use strict"</span>;
```

hast trees can be turned into other things, like virtual DOMs, with
[`hast-to-hyperscript`][to-hyperscript].

hast trees are also used throughout the **[rehype][]** (**[unified][]**)
ecosystem:

```js
import unified from 'unified'
import rehypeStringify from 'rehype-stringify'
import {lowlight} from 'lowlight'

var tree = lowlight.highlight('js', '"use strict";').value

var processor = unified().use(rehypeStringify)
var html = processor.stringify({type: 'root', children: tree}).toString()

console.log(html)
```

Yields:

```html
<span class="hljs-meta">"use strict"</span>;
```

## API

This package exports the following identifiers: `lowlight`.
There is no default export.

### `lowlight.highlight(language, value[, options])`

Parse `value` (`string`) according to the [`language`][names] grammar.

###### `options`

*   `prefix` (`string?`, default: `'hljs-'`) — Class prefix

###### Returns

[`Result`][result].

###### Example

```js
import {lowlight} from 'lowlight'

console.log(lowlight.highlight('css', 'em { color: red }'))
```

Yields:

```js
{relevance: 3, language: 'css', value: [Array]}

```

### `lowlight.highlightAuto(value[, options])`

Parse `value` by guessing its grammar.

###### `options`

*   `prefix` (`string?`, default: `'hljs-'`)
    — Class prefix
*   `subset` (`Array.<string>?` default: all registered languages)
    — List of allowed languages

###### Returns

[`Result`][result]

###### Example

```js
import {lowlight} from 'lowlight'

console.log(lowlight.highlightAuto('"hello, " + name + "!"'))
```

Yields:

```js
{relevance: 3, language: 'applescript', value: [Array]}
```

### `Result`

`Result` is a highlighting result object.

###### Properties

*   `relevance` (`number`)
    — How sure **low** is that the given code is in the found language
*   `language` (`string`)
    — The detected `language` name
*   `value` ([`Array.<Node>`][hast-node])
    — Virtual nodes representing the highlighted given code

### `lowlight.registerLanguage(language, syntax)`

Register a [syntax][] as `language` (`string`).
Useful in the browser or with custom grammars.

###### Example

```js
import {lowlight} from 'lowlight/lib/core.js'
import xml from 'highlight.js/lib/languages/xml.js'

lowlight.registerLanguage('xml', xml)

console.log(lowlight.highlight('html', '<em>Emphasis</em>'))
```

Yields:

```js
{relevance: 2, language: 'html', value: [Array]}
```

### `lowlight.registerAlias(language, alias)`

Register a new `alias` for `language`.

###### Signatures

*   `registerAlias(language, alias|list)`
*   `registerAlias(aliases)`

###### Parameters

*   `language` (`string`) — [Name][names] of a registered language
*   `alias` (`string`) — New alias for the registered language
*   `list` (`Array.<alias>`) — List of aliases
*   `aliases` (`Object.<language, alias|list>`) — Map where each key is a
    `language` and each value an `alias` or a `list`

###### Example

```js
import {lowlight} from 'lowlight/lib/core.js'
import md from 'highlight.js/lib/languages/markdown.js'

lowlight.registerLanguage('markdown', md)

// lowlight.highlight('mdown', '<em>Emphasis</em>')
// ^ would throw: Error: Unknown language: `mdown` is not registered

lowlight.registerAlias({markdown: ['mdown', 'mkdn', 'mdwn', 'ron']})
lowlight.highlight('mdown', '<em>Emphasis</em>')
// ^ Works!
```

### `lowlight.listLanguages()`

List all registered languages.

###### Returns

`Array.<string>`.

###### Example

```js
import {lowlight} from 'lowlight/lib/core.js'
import md from 'highlight.js/lib/languages/markdown.js'

console.log(lowlight.listLanguages()) // => []

lowlight.registerLanguage('markdown', md)

console.log(lowlight.listLanguages()) // => ['markdown']
```

## Browser

It is not suggested to use the pre-built files or requiring `lowlight` in the
browser as that would include 916kB (260kB GZipped) of code.

Instead, require `lowlight/lib/core`, and include only the used highlighters.
For example:

```js
import {lowlight} from 'lowlight/lib/core.js'
import js from 'highlight.js/lib/languages/javascript.js'

lowlight.registerLanguage('javascript', js)

lowlight.highlight('js', '"use strict";')
// See `Usage` for the results.
```

…when using [browserify][] and minifying with [tinyify][] this results in 24kB
of code (9kB with GZip).

## Related

*   [`refractor`][refractor] — Same, but based on [Prism][]

## Projects

*   [`emphasize`](https://github.com/wooorm/emphasize)
    — Syntax highlighting in ANSI, for the terminal
*   [`react-lowlight`](https://github.com/rexxars/react-lowlight)
    — Syntax highlighter for [React][]
*   [`react-syntax-highlighter`](https://github.com/conorhastings/react-syntax-highlighter)
    — [React][] component for syntax highlighting
*   [`rehype-highlight`](https://github.com/rehypejs/rehype-highlight)
    — Syntax highlighting in [**rehype**](https://github.com/rehypejs/rehype)
*   [`remark-highlight.js`](https://github.com/ben-eb/remark-highlight.js)
    — Syntax highlighting in [**remark**](https://github.com/remarkjs/remark)
*   [`jstransformer-lowlight`](https://github.com/ai/jstransformer-lowlight)
    — Syntax highlighting for [JSTransformers](https://github.com/jstransformers)
    and [Pug](https://pugjs.org/language/filters.html)

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/lowlight/workflows/main/badge.svg

[build]: https://github.com/wooorm/lowlight/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/lowlight.svg

[coverage]: https://codecov.io/github/wooorm/lowlight

[downloads-badge]: https://img.shields.io/npm/dm/lowlight.svg

[downloads]: https://www.npmjs.com/package/lowlight

[size-badge]: https://img.shields.io/bundlephobia/minzip/lowlight.svg

[size]: https://bundlephobia.com/result?p=lowlight

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[to-html]: https://github.com/syntax-tree/hast-util-to-html

[rehype]: https://github.com/rehypejs/rehype

[unified]: https://github.com/unifiedjs/unified

[hast-node]: https://github.com/syntax-tree/hast#ast

[highlight.js]: https://github.com/highlightjs/highlight.js

[syntax]: https://github.com/highlightjs/highlight.js/blob/main/docs/language-guide.rst

[names]: https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md

[react]: https://facebook.github.io/react/

[vdom]: https://github.com/Matt-Esch/virtual-dom

[to-hyperscript]: https://github.com/syntax-tree/hast-to-hyperscript

[browser]: #browser

[result]: #result

[prism]: https://github.com/PrismJS/prism

[refractor]: https://github.com/wooorm/refractor

[browserify]: https://github.com/browserify/browserify

[tinyify]: https://github.com/browserify/tinyify
