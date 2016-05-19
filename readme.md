# lowlight [![Build Status][travis-badge]][travis] [![Coverage Status][codecov-badge]][codecov]

Virtual syntax highlighting for virtual DOMs and non-HTML things,
with language auto-detection.  Perfect for [React][], [VDOM][], and
others.

Lowlight is built to work with all syntaxes supported by [highlight.js][],
that’s [155 languages][names] (and all 73 themes).

## Installation

[npm][npm-install]:

```bash
npm install lowlight
```

**lowlight** is also available for [duo][duo-install], and as an AMD,
CommonJS, and globals module, [uncompressed and compressed][releases].
Read more about [usage in the browser][browser].

## Usage

Dependencies:

```javascript

var hast = require('hast');
var low = require('lowlight');
```

Compile:

```javascript

var ast = low.highlight('js', '"use strict";').value;
var html = hast.stringify({'type': 'root', 'children': ast});
```

Yields:

```json
[
  {
    "type": "element",
    "tagName": "span",
    "properties": {
      "className": [
        "hljs-meta"
      ]
    },
    "children": [
      {
        "type": "text",
        "value": "\"use strict\""
      }
    ]
  },
  {
    "type": "text",
    "value": ";"
  }
]
```

Or, stringified with [hast][]:

```html
<span class="hljs-meta">&quot;use strict&quot;</span>;
```

## API

### `low.highlight(language, value[, options])`

Parse `value` according to the `language` grammar.

**Parameters**

*   `name` (`string`) — See list of [names and aliases][names];

*   `value` (`string`) — Source to highlight;

*   `options` (`Object?`, optional):

    *   `prefix` (`string?`, default: `'hljs-'`)
        — Class prefix.

**Returns**: `Object`:

*   `relevance` (`number`)
    — Integer representing how sure **low** is the given code is in
    the given language;

*   `language` (`string`) — The given `language`;

*   `value` ([`Array.<Node>`][hast-node]) — [Hast nodes][hast-node]
    representing the highlighted given code.

### `low.highlightAuto(value[, options])`

Parse `value` by guessing its grammar.

**Parameters**

*   `value` (`string`) — Source to highlight;

*   `options` (`Object?`, optional):

    *   `prefix` (`string?`, default: `'hljs-'`)
        — Class prefix;

    *   `subset` (`Array.<string>?`, optional, defaults to
        all registered languages.)
        — List of allowed languages.

**Returns**: `Object`:

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

Register a syntax. Useful in the browser or with custom grammars.

**Parameters**

*   `name` (`string`) — Name of language;

*   `syntax` (`Function`) — Syntax highlighter, see
    [`highlight.js`s docs][syntax] for more information.

## Lowlight in the browser

I do not suggest using the pre-built files or requiring `lowlight` in
the browser as that would include a 530kb (170kb with GZIP) file.

Instead, require `lowlight/lib/core`, and include only the used
highlighters.  For example:

```js
var low = require('lowlight/lib/core');
var js = require('highlight.js/lib/languages/javascript');

low.registerLanguage('javascript', js);

low.highlight('js', '"use strict";');
// See `Usage` for the results.
```

...When using browserify, minifying, and GZIP that results in just
17kb of code (7kb with GZIP).

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[travis-badge]: https://img.shields.io/travis/wooorm/lowlight.svg

[travis]: https://travis-ci.org/wooorm/lowlight

[codecov-badge]: https://img.shields.io/codecov/c/github/wooorm/lowlight.svg

[codecov]: https://codecov.io/github/wooorm/lowlight

[npm-install]: https://docs.npmjs.com/cli/install

[duo-install]: http://duojs.org/#getting-started

[releases]: https://github.com/wooorm/lowlight/releases

[license]: LICENSE

[author]: http://wooorm.com

[hast]: https://github.com/wooorm/hast

[hast-node]: https://github.com/wooorm/hast#nodes

[highlight.js]: https://github.com/isagalaev/highlight.js

[syntax]: https://github.com/isagalaev/highlight.js/blob/master/docs/language-guide.rst

[names]: https://github.com/isagalaev/highlight.js/blob/master/docs/css-classes-reference.rst#language-names-and-aliases

[react]: https://facebook.github.io/react/

[vdom]: https://github.com/Matt-Esch/virtual-dom

[browser]: #lowlight-in-the-browser
