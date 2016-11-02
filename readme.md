# lowlight [![Build Status][travis-badge]][travis] [![Coverage Status][codecov-badge]][codecov]

Virtual syntax highlighting for virtual DOMs and non-HTML things,
with language auto-detection.  Perfect for [React][], [VDOM][], and
others.

Lowlight is built to work with all syntaxes supported by [highlight.js][],
that’s [168 languages][names] (and all 73 themes).

## Table of Contents

*   [Installation](#installation)
*   [Usage](#usage)
*   [API](#api)
    *   [low.highlight(language, value\[, options\])](#lowhighlightlanguage-value-options)
    *   [low.highlightAuto(value\[, options\])](#lowhighlightautovalue-options)
    *   [low.registerLanguage(name, syntax)](#lowregisterlanguagename-syntax)
*   [Browser](#browser)
*   [Projects](#projects)
*   [License](#license)

## Installation

[npm][]:

```bash
npm install lowlight
```

[Usage in the browser »][browser]

## Usage

Highlight:

```javascript
var low = require('lowlight');
var ast = low.highlight('js', '"use strict";').value;
```

Yields:

```js
[ { type: 'element',
    tagName: 'span',
    properties: { className: [ 'hljs-meta' ] },
    children: [ { type: 'text', value: '"use strict"' } ] },
  { type: 'text', value: ';' } ]
```

Or, stringified with [rehype][]:

```js
var rehype = require('rehype');
var html = rehype().stringify({type: 'root', children: ast}).toString();
```

Yields:

```html
<span class="hljs-meta">"use strict"</span>;
```

> **Tip**: Use [`hast-to-hyperscript`][to-hyperscript] to transform
> to other virtual DOMs, or DIY.

## API

### `low.highlight(language, value[, options])`

Parse `value` according to the `language` grammar.

##### Parameters

*   `name` (`string`) — See list of [names and aliases][names];
*   `value` (`string`) — Source to highlight;
*   `options` (`Object?`, optional):
    *   `prefix` (`string?`, default: `'hljs-'`) — Class prefix.

###### Returns

`Object`:

*   `relevance` (`number`)
    — Integer representing how sure **low** is the given code is in
    the given language;
*   `language` (`string`) — The given `language`;
*   `value` ([`Array.<Node>`][hast-node]) — [Hast nodes][hast-node]
    representing the highlighted given code.

### `low.highlightAuto(value[, options])`

Parse `value` by guessing its grammar.

###### Parameters

*   `value` (`string`) — Source to highlight;
*   `options` (`Object?`, optional):
    *   `prefix` (`string?`, default: `'hljs-'`)
        — Class prefix;
    *   `subset` (`Array.<string>?`, optional, defaults to
        all registered languages.)
        — List of allowed languages.

###### Returns

`Object`:

*   `relevance` (`number`)
    — Integer representing how sure **low** is the given code
    is in the detected language;
*   `language` (`string`) — The given `language`;
*   `value` ([`Array.<Node>`][hast-node]) — [Hast nodes][hast-node]
    representing the highlighted given code.
*   `secondBest` (`Object?`)
    — Object with the same structure as the top returned object, but
    containing information for the second-best result.
    Can be `null`.

### `low.registerLanguage(name, syntax)`

Register a syntax.  Useful in the browser or with custom grammars.

###### Parameters

*   `name` (`string`) — Name of language;
*   `syntax` (`Function`) — Syntax highlighter, see
    [`highlight.js`s docs][syntax] for more information.

## Browser

I do not suggest using the pre-built files or requiring `lowlight` in
the browser as that would include a 530kb (170kb GZipped) file.

Instead, require `lowlight/lib/core`, and include only the used
highlighters.  For example:

```js
var low = require('lowlight/lib/core');
var js = require('highlight.js/lib/languages/javascript');

low.registerLanguage('javascript', js);

low.highlight('js', '"use strict";');
// See `Usage` for the results.
```

...When using browserify, minifying this results in just 17kb of code
(7kb with GZip).

## Projects

*   [`emphasize`](https://github.com/wooorm/emphasize)
    — Syntax highlighting in ANSI, for the terminal;
*   [`react-lowlight`](https://github.com/rexxars/react-lowlight)
    — Syntax highlighter for [React][];
*   [`react-syntax-highlighter`](https://github.com/conorhastings/react-syntax-highlighter)
    — [React][] component for syntax highlighting.
*   [`rehype-highlight`](https://github.com/wooorm/rehype-highlight)
    — Syntax highlighting in [**rehype**](https://github.com/wooorm/rehype);
*   [`remark-highlight.js`](https://github.com/ben-eb/remark-highlight.js)
    — Syntax highlighting in [**remark**](https://github.com/wooorm/remark);

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[travis-badge]: https://img.shields.io/travis/wooorm/lowlight.svg

[travis]: https://travis-ci.org/wooorm/lowlight

[codecov-badge]: https://img.shields.io/codecov/c/github/wooorm/lowlight.svg

[codecov]: https://codecov.io/github/wooorm/lowlight

[npm]: https://docs.npmjs.com/cli/install

[license]: LICENSE

[author]: http://wooorm.com

[rehype]: https://github.com/wooorm/rehype

[hast-node]: https://github.com/wooorm/hast#nodes

[highlight.js]: https://github.com/isagalaev/highlight.js

[syntax]: https://github.com/isagalaev/highlight.js/blob/master/docs/language-guide.rst

[names]: https://github.com/isagalaev/highlight.js/blob/master/docs/css-classes-reference.rst#language-names-and-aliases

[react]: https://facebook.github.io/react/

[vdom]: https://github.com/Matt-Esch/virtual-dom

[to-hyperscript]: https://github.com/wooorm/hast-to-hyperscript

[browser]: #browser
