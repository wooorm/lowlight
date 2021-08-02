# lowlight

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Virtual syntax highlighting for virtual DOMs and non-HTML things, with language
auto-detection.
Perfect for [React][], [VDOM][], and others.

Lowlight is built to work with all syntaxes supported by [highlight.js][].
There are three builds of lowlight:

<!--index start-->

*   `lib/core.js` — 0 languages
*   `lib/common.js` (default) — 35 languages
*   `lib/all.js` — 191 languages

<!--index end-->

Want to use [Prism][] instead?
Try [`refractor`][refractor]!

## Contents

*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`lowlight.highlight(language, value[, options])`](#lowlighthighlightlanguage-value-options)
    *   [`lowlight.highlightAuto(value[, options])`](#lowlighthighlightautovalue-options)
    *   [`lowlight.registerLanguage(language, syntax)`](#lowlightregisterlanguagelanguage-syntax)
    *   [`lowlight.registerAlias(language, alias)`](#lowlightregisteraliaslanguage-alias)
    *   [`lowlight.listLanguages()`](#lowlightlistlanguages)
*   [Syntaxes](#syntaxes)
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

## Use

Highlight:

```js
import {lowlight} from 'lowlight'

const tree = lowlight.highlight('js', '"use strict";')

console.dir(tree, {depth: null})
```

Yields:

```js
{
  type: 'root',
  data: {language: 'js', relevance: 10},
  children: [
    {
      type: 'element',
      tagName: 'span',
      properties: {className: ['hljs-meta']},
      children: [{type: 'text', value: '"use strict"'}]
    },
    {type: 'text', value: ';'}
  ]
}
```

hast trees can be serialized with [`hast-util-to-html`][to-html]:

```js
import {lowlight} from 'lowlight'
import {toHtml} from 'hast-util-to-html'

const tree = lowlight.highlight('js', '"use strict";')

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
import {unified} from 'unified'
import rehypeStringify from 'rehype-stringify'
import {lowlight} from 'lowlight'

const tree = lowlight.highlight('js', '"use strict";')

const processor = unified().use(rehypeStringify)
const html = processor.stringify(tree).toString()

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

A hast [`Root`][root] with two `data` fields:

*   `relevance` (`number`) — How sure **low** is that the given code is in the
    language
*   `language` (`string`) — The detected `language` name

###### Example

```js
import {lowlight} from 'lowlight'

console.log(lowlight.highlight('css', 'em { color: red }'))
```

Yields:

```js
{type: 'root', data: {language: 'css', relevance: 3}, children: [Array]}
```

### `lowlight.highlightAuto(value[, options])`

Parse `value` by guessing its grammar.

###### `options`

The options of `lowlight.highlight` are supported, plus:

*   `subset` (`Array.<string>?` default: all registered languages)
    — List of allowed languages

###### Returns

The same result as `lowlight.highlight` is returned.

###### Example

```js
import {lowlight} from 'lowlight'

console.log(lowlight.highlightAuto('"hello, " + name + "!"'))
```

Yields:

```js
{type: 'root', data: {language: 'applescript', relevance: 3}, children: [Array]}

```

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
{type: 'root', data: {language: 'html', relevance: 2}, children: [Array]}
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

## Syntaxes

If you’re using `lowlight/lib/core.js`, no syntaxes are included.
Checked syntaxes are included if you import `lowlight` (or
`lowlight/lib/common.js`).
Unchecked syntaxes are available through `lowlight/lib/all.js`

Note that highlight.js works as a singleton.
That means that if you register a syntax anywhere in your project, it’ll become
available everywhere!

<!--support start-->

*   [ ] `1c` — 1C:Enterprise
*   [ ] `abnf` — Augmented Backus-Naur Form
*   [ ] `accesslog` — Apache Access Log
*   [ ] `actionscript` (`as`) — ActionScript
*   [ ] `ada` — Ada
*   [ ] `angelscript` (`asc`) — AngelScript
*   [ ] `apache` (`apacheconf`) — Apache config
*   [ ] `applescript` (`osascript`) — AppleScript
*   [ ] `arcade` — ArcGIS Arcade
*   [x] `arduino` (`ino`) — Arduino
*   [ ] `armasm` (`arm`) — ARM Assembly
*   [ ] `asciidoc` (`adoc`) — AsciiDoc
*   [ ] `aspectj` — AspectJ
*   [ ] `autohotkey` (`ahk`) — AutoHotkey
*   [ ] `autoit` — AutoIt
*   [ ] `avrasm` — AVR Assembly
*   [ ] `awk` — Awk
*   [ ] `axapta` (`x++`) — X++
*   [x] `bash` (`sh`) — Bash
*   [ ] `basic` — BASIC
*   [ ] `bnf` — Backus–Naur Form
*   [ ] `brainfuck` (`bf`) — Brainfuck
*   [x] `c` (`h`) — C
*   [ ] `cal` — C/AL
*   [ ] `capnproto` (`capnp`) — Cap’n Proto
*   [ ] `ceylon` — Ceylon
*   [ ] `clean` (`icl`, `dcl`) — Clean
*   [ ] `clojure` (`clj`, `edn`) — Clojure
*   [ ] `clojure-repl` — Clojure REPL
*   [ ] `cmake` (`cmake.in`) — CMake
*   [ ] `coffeescript` (`coffee`, `cson`, `iced`) — CoffeeScript
*   [ ] `coq` — Coq
*   [ ] `cos` (`cls`) — Caché Object Script
*   [x] `cpp` (`cc`, `c++`, `h++`, `hpp`, `hh`, `hxx`, `cxx`) — C++
*   [ ] `crmsh` (`crm`, `pcmk`) — crmsh
*   [ ] `crystal` (`cr`) — Crystal
*   [x] `csharp` (`cs`, `c#`) — C#
*   [ ] `csp` — CSP
*   [x] `css` — CSS
*   [ ] `d` — D
*   [ ] `dart` — Dart
*   [ ] `delphi` (`dpr`, `dfm`, `pas`, `pascal`) — Delphi
*   [x] `diff` (`patch`) — Diff
*   [ ] `django` (`jinja`) — Django
*   [ ] `dns` (`bind`, `zone`) — DNS Zone
*   [ ] `dockerfile` (`docker`) — Dockerfile
*   [ ] `dos` (`bat`, `cmd`) — Batch file (DOS)
*   [ ] `dsconfig` — undefined
*   [ ] `dts` — Device Tree
*   [ ] `dust` (`dst`) — Dust
*   [ ] `ebnf` — Extended Backus-Naur Form
*   [ ] `elixir` (`ex`, `exs`) — Elixir
*   [ ] `elm` — Elm
*   [ ] `erb` — ERB
*   [ ] `erlang` (`erl`) — Erlang
*   [ ] `erlang-repl` — Erlang REPL
*   [ ] `excel` (`xlsx`, `xls`) — Excel formulae
*   [ ] `fix` — FIX
*   [ ] `flix` — Flix
*   [ ] `fortran` (`f90`, `f95`) — Fortran
*   [ ] `fsharp` (`fs`) — F#
*   [ ] `gams` (`gms`) — GAMS
*   [ ] `gauss` (`gss`) — GAUSS
*   [ ] `gcode` (`nc`) — G-code (ISO 6983)
*   [ ] `gherkin` (`feature`) — Gherkin
*   [ ] `glsl` — GLSL
*   [ ] `gml` — GML
*   [x] `go` (`golang`) — Go
*   [ ] `golo` — Golo
*   [ ] `gradle` — Gradle
*   [ ] `groovy` — Groovy
*   [ ] `haml` — HAML
*   [ ] `handlebars` (`hbs`, `html.hbs`, `html.handlebars`, `htmlbars`) — Handlebars
*   [ ] `haskell` (`hs`) — Haskell
*   [ ] `haxe` (`hx`) — Haxe
*   [ ] `hsp` — HSP
*   [ ] `http` (`https`) — HTTP
*   [ ] `hy` (`hylang`) — Hy
*   [ ] `inform7` (`i7`) — Inform 7
*   [x] `ini` (`toml`) — TOML, also INI
*   [ ] `irpf90` — IRPF90
*   [ ] `isbl` — ISBL
*   [x] `java` (`jsp`) — Java
*   [x] `javascript` (`js`, `jsx`, `mjs`, `cjs`) — Javascript
*   [ ] `jboss-cli` (`wildfly-cli`) — JBoss CLI
*   [x] `json` — JSON
*   [ ] `julia` — Julia
*   [ ] `julia-repl` — Julia REPL
*   [x] `kotlin` (`kt`, `kts`) — Kotlin
*   [ ] `lasso` (`ls`, `lassoscript`) — Lasso
*   [ ] `latex` (`tex`) — LaTeX
*   [ ] `ldif` — LDIF
*   [ ] `leaf` — Leaf
*   [x] `less` — Less
*   [ ] `lisp` — Lisp
*   [ ] `livecodeserver` — LiveCode
*   [ ] `livescript` (`ls`) — LiveScript
*   [ ] `llvm` — LLVM IR
*   [ ] `lsl` — LSL (Linden Scripting Language)
*   [x] `lua` — Lua
*   [x] `makefile` (`mk`, `mak`, `make`) — Makefile
*   [x] `markdown` (`md`, `mkdown`, `mkd`) — Markdown
*   [ ] `mathematica` (`mma`, `wl`) — Mathematica
*   [ ] `matlab` — Matlab
*   [ ] `maxima` — Maxima
*   [ ] `mel` — MEL
*   [ ] `mercury` (`m`, `moo`) — Mercury
*   [ ] `mipsasm` (`mips`) — MIPS Assembly
*   [ ] `mizar` — Mizar
*   [ ] `mojolicious` — Mojolicious
*   [ ] `monkey` — Monkey
*   [ ] `moonscript` (`moon`) — MoonScript
*   [ ] `n1ql` — N1QL
*   [ ] `nestedtext` (`nt`) — Nested Text
*   [ ] `nginx` (`nginxconf`) — Nginx config
*   [ ] `nim` — Nim
*   [ ] `nix` (`nixos`) — Nix
*   [ ] `node-repl` — Node REPL
*   [ ] `nsis` — NSIS
*   [x] `objectivec` (`mm`, `objc`, `obj-c`, `obj-c++`, `objective-c++`) — Objective-C
*   [ ] `ocaml` (`ml`) — OCaml
*   [ ] `openscad` (`scad`) — OpenSCAD
*   [ ] `oxygene` — Oxygene
*   [ ] `parser3` — Parser3
*   [x] `perl` (`pl`, `pm`) — Perl
*   [ ] `pf` (`pf.conf`) — Packet Filter config
*   [ ] `pgsql` (`postgres`, `postgresql`) — PostgreSQL
*   [x] `php` — undefined
*   [x] `php-template` — PHP template
*   [x] `plaintext` (`text`, `txt`) — Plain text
*   [ ] `pony` — Pony
*   [ ] `powershell` (`pwsh`, `ps`, `ps1`) — PowerShell
*   [ ] `processing` (`pde`) — Processing
*   [ ] `profile` — Python profiler
*   [ ] `prolog` — Prolog
*   [ ] `properties` — .properties
*   [ ] `protobuf` — Protocol Buffers
*   [ ] `puppet` (`pp`) — Puppet
*   [ ] `purebasic` (`pb`, `pbi`) — PureBASIC
*   [x] `python` (`py`, `gyp`, `ipython`) — Python
*   [x] `python-repl` (`pycon`) — undefined
*   [ ] `q` (`k`, `kdb`) — Q
*   [ ] `qml` (`qt`) — QML
*   [x] `r` — R
*   [ ] `reasonml` (`re`) — ReasonML
*   [ ] `rib` — RenderMan RIB
*   [ ] `roboconf` (`graph`, `instances`) — Roboconf
*   [ ] `routeros` (`mikrotik`) — Microtik RouterOS script
*   [ ] `rsl` — RenderMan RSL
*   [x] `ruby` (`rb`, `gemspec`, `podspec`, `thor`, `irb`) — Ruby
*   [ ] `ruleslanguage` — Oracle Rules Language
*   [x] `rust` (`rs`) — Rust
*   [ ] `sas` — SAS
*   [ ] `scala` — Scala
*   [ ] `scheme` — Scheme
*   [ ] `scilab` (`sci`) — Scilab
*   [x] `scss` — SCSS
*   [x] `shell` (`console`, `shellsession`) — Shell Session
*   [ ] `smali` — Smali
*   [ ] `smalltalk` (`st`) — Smalltalk
*   [ ] `sml` (`ml`) — SML (Standard ML)
*   [ ] `sqf` — SQF
*   [x] `sql` — SQL
*   [ ] `stan` (`stanfuncs`) — Stan
*   [ ] `stata` (`do`, `ado`) — Stata
*   [ ] `step21` (`p21`, `step`, `stp`) — STEP Part 21
*   [ ] `stylus` (`styl`) — Stylus
*   [ ] `subunit` — SubUnit
*   [x] `swift` — Swift
*   [ ] `taggerscript` — Tagger Script
*   [ ] `tap` — Test Anything Protocol
*   [ ] `tcl` (`tk`) — Tcl
*   [ ] `thrift` — Thrift
*   [ ] `tp` — TP
*   [ ] `twig` (`craftcms`) — Twig
*   [x] `typescript` (`ts`, `tsx`) — TypeScript
*   [ ] `vala` — Vala
*   [x] `vbnet` (`vb`) — Visual Basic .NET
*   [ ] `vbscript` (`vbs`) — VBScript
*   [ ] `vbscript-html` — VBScript in HTML
*   [ ] `verilog` (`v`, `sv`, `svh`) — Verilog
*   [ ] `vhdl` — VHDL
*   [ ] `vim` — Vim Script
*   [ ] `wasm` — WebAssembly
*   [ ] `wren` — Wren
*   [ ] `x86asm` — Intel x86 Assembly
*   [ ] `xl` (`tao`) — XL
*   [x] `xml` (`html`, `xhtml`, `rss`, `atom`, `xjb`, `xsd`, `xsl`, `plist`, `wsf`, `svg`) — HTML, XML
*   [ ] `xquery` (`xpath`, `xq`) — XQuery
*   [x] `yaml` (`yml`) — YAML
*   [ ] `zephir` (`zep`) — Zephir

<!--support end-->

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

[root]: https://github.com/syntax-tree/hast#root

[highlight.js]: https://github.com/highlightjs/highlight.js

[syntax]: https://github.com/highlightjs/highlight.js/blob/main/docs/language-guide.rst

[names]: https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md

[react]: https://facebook.github.io/react/

[vdom]: https://github.com/Matt-Esch/virtual-dom

[to-hyperscript]: https://github.com/syntax-tree/hast-to-hyperscript

[prism]: https://github.com/PrismJS/prism

[refractor]: https://github.com/wooorm/refractor
