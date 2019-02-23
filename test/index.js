'use strict'

var fs = require('fs')
var path = require('path')
var test = require('tape')
var rehype = require('rehype')
var removePosition = require('unist-util-remove-position')
var low = require('..')

var join = path.join

var fixtures = path.join(__dirname, 'fixture')
var inputName = 'input.txt'
var outputName = 'output.txt'

test('lowlight.highlight(language, value[, options])', function(t) {
  var result = low.highlight('js', '')

  t.throws(
    function() {
      low.highlight(true)
    },
    /Expected `string` for name, got `true`/,
    'should throw when not given `string` for `name`'
  )

  t.throws(
    function() {
      low.highlight('js', true)
    },
    /Expected `string` for value, got `true`/,
    'should throw when not given `string` for `value`'
  )

  t.throws(
    function() {
      low.highlight('fooscript', '')
    },
    /Unknown language: `fooscript` is not registered/,
    'should throw when given an unknown `language`'
  )

  t.equal(result.relevance, 0, 'should return a `0` for `relevance` when empty')

  t.deepEqual(
    result.value,
    [],
    'should return an empty array for `value` when empty'
  )

  t.deepEqual(
    low.highlight('js', '# foo').value,
    [{type: 'text', value: '# foo'}],
    'should silently ignore illegals'
  )

  t.deepEqual(
    low.highlight('js', '# foo', {ignore: true}).value,
    [{type: 'text', value: '# foo'}],
    'should silently ignore illegals'
  )

  t.test('fixture', function(st) {
    var result = low.highlight(
      'java',
      ['public void moveTo(int x, int y, int z);'].join('\n')
    )

    st.equal(
      result.relevance,
      6,
      'should return the correct relevance for the fixture'
    )

    st.equal(
      result.language,
      'java',
      'should return the correct language for the fixture'
    )

    st.deepEqual(
      result.value,
      [
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['hljs-function']},
          children: [
            {
              type: 'element',
              tagName: 'span',
              properties: {className: ['hljs-keyword']},
              children: [{type: 'text', value: 'public'}]
            },
            {type: 'text', value: ' '},
            {
              type: 'element',
              tagName: 'span',
              properties: {className: ['hljs-keyword']},
              children: [{type: 'text', value: 'void'}]
            },
            {type: 'text', value: ' '},
            {
              type: 'element',
              tagName: 'span',
              properties: {className: ['hljs-title']},
              children: [{type: 'text', value: 'moveTo'}]
            },
            {
              type: 'element',
              tagName: 'span',
              properties: {className: ['hljs-params']},
              children: [
                {type: 'text', value: '('},
                {
                  type: 'element',
                  tagName: 'span',
                  properties: {className: ['hljs-keyword']},
                  children: [{type: 'text', value: 'int'}]
                },
                {type: 'text', value: ' x, '},
                {
                  type: 'element',
                  tagName: 'span',
                  properties: {className: ['hljs-keyword']},
                  children: [{type: 'text', value: 'int'}]
                },
                {type: 'text', value: ' y, '},
                {
                  type: 'element',
                  tagName: 'span',
                  properties: {className: ['hljs-keyword']},
                  children: [{type: 'text', value: 'int'}]
                },
                {type: 'text', value: ' z)'}
              ]
            }
          ]
        },
        {type: 'text', value: ';'}
      ],
      'should return the correct AST for the fixture'
    )

    st.end()
  })

  t.test('custom `prefix`', function(st) {
    var result = low.highlight('js', '"use strict";', {
      prefix: 'foo-'
    })

    t.deepEqual(
      result.value[0].properties.className,
      ['foo-meta'],
      'should support a given custom `prefix`'
    )

    st.end()
  })

  t.test('empty `prefix`', function(st) {
    var result = low.highlight('js', '"use strict";', {
      prefix: ''
    })

    t.deepEqual(
      result.value[0].properties.className,
      ['meta'],
      'should support an empty `prefix`'
    )

    st.end()
  })

  t.end()
})

test('lowlight(value[, options])', function(t) {
  var result = low.highlightAuto('')

  t.throws(
    function() {
      low.highlightAuto(true)
    },
    /Expected `string` for value, got `true`/,
    'should throw when not given a string'
  )

  t.equal(result.relevance, 0, 'should return a `0` for `relevance` when empty')

  t.equal(
    result.language,
    null,
    'should return `null` for `language` when empty'
  )

  t.deepEqual(
    result.value,
    [],
    'should return an empty array for `value` when empty'
  )

  t.test('fixture', function(st) {
    var result = low.highlightAuto(['"use strict";'].join('\n'))

    st.equal(
      result.relevance,
      10,
      'should return the correct relevance for the fixture'
    )

    st.equal(
      result.language,
      'javascript',
      'should return the correct language for the fixture'
    )

    st.equal(
      typeof result.secondBest,
      'object',
      'should return a `secondBest` result'
    )

    st.equal(
      result.secondBest.language,
      'abnf',
      'should return a `secondBest` `language`'
    )

    st.equal(
      result.secondBest.relevance,
      2,
      'should return a `secondBest` `relevance`'
    )

    st.deepEqual(
      result.value,
      [
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['hljs-meta']},
          children: [{type: 'text', value: '"use strict"'}]
        },
        {type: 'text', value: ';'}
      ],
      'should return the correct AST for the fixture'
    )

    st.end()
  })

  t.test('custom `prefix`', function(st) {
    var result = low.highlightAuto('"use strict";', {prefix: 'foo-'})

    t.deepEqual(
      result.value[0].properties.className,
      ['foo-meta'],
      'should support a given custom `prefix`'
    )

    st.end()
  })

  t.test('empty `prefix`', function(st) {
    var result = low.highlightAuto('"use strict";', {prefix: ''})

    t.deepEqual(
      result.value[0].properties.className,
      ['meta'],
      'should support an empty `prefix`'
    )

    st.end()
  })

  t.test('custom `subset`', function(st) {
    var result = low.highlightAuto('"use strict";', {subset: ['java']})

    t.equal(result.language, 'java', 'should support a given custom `subset`')

    t.doesNotThrow(function() {
      result = low.highlightAuto('"use strict";', {
        subset: ['fooscript', 'javascript']
      })
    }, 'should ignore unregistered subset languages (#1)')

    t.equal(
      result.language,
      'javascript',
      'should ignore unregistered subset languages (#2)'
    )

    st.end()
  })

  t.test('harder example (coverage)', function(st) {
    subtest(st, 'xml-large', function(doc) {
      return low.highlightAuto(doc)
    })

    st.end()
  })

  t.end()
})

test('fixtures', function(t) {
  fs.readdirSync(fixtures).forEach(each)

  function each(basename) {
    if (basename.charAt(0) !== '.') {
      subtest(t, basename, function(doc, language) {
        return low.highlight(language, doc)
      })
    }
  }

  t.end()
})

test('listLanguages', function(t) {
  var expectedLanguages = [
    '1c',
    'abnf',
    'accesslog',
    'actionscript',
    'ada',
    'angelscript',
    'apache',
    'applescript',
    'arcade',
    'cpp',
    'arduino',
    'armasm',
    'xml',
    'asciidoc',
    'aspectj',
    'autohotkey',
    'autoit',
    'avrasm',
    'awk',
    'axapta',
    'bash',
    'basic',
    'bnf',
    'brainfuck',
    'cal',
    'capnproto',
    'ceylon',
    'clean',
    'clojure',
    'clojure-repl',
    'cmake',
    'coffeescript',
    'coq',
    'cos',
    'crmsh',
    'crystal',
    'cs',
    'csp',
    'css',
    'd',
    'markdown',
    'dart',
    'delphi',
    'diff',
    'django',
    'dns',
    'dockerfile',
    'dos',
    'dsconfig',
    'dts',
    'dust',
    'ebnf',
    'elixir',
    'elm',
    'ruby',
    'erb',
    'erlang-repl',
    'erlang',
    'excel',
    'fix',
    'flix',
    'fortran',
    'fsharp',
    'gams',
    'gauss',
    'gcode',
    'gherkin',
    'glsl',
    'gml',
    'go',
    'golo',
    'gradle',
    'groovy',
    'haml',
    'handlebars',
    'haskell',
    'haxe',
    'hsp',
    'htmlbars',
    'http',
    'hy',
    'inform7',
    'ini',
    'irpf90',
    'isbl',
    'java',
    'javascript',
    'jboss-cli',
    'json',
    'julia',
    'julia-repl',
    'kotlin',
    'lasso',
    'ldif',
    'leaf',
    'less',
    'lisp',
    'livecodeserver',
    'livescript',
    'llvm',
    'lsl',
    'lua',
    'makefile',
    'mathematica',
    'matlab',
    'maxima',
    'mel',
    'mercury',
    'mipsasm',
    'mizar',
    'perl',
    'mojolicious',
    'monkey',
    'moonscript',
    'n1ql',
    'nginx',
    'nimrod',
    'nix',
    'nsis',
    'objectivec',
    'ocaml',
    'openscad',
    'oxygene',
    'parser3',
    'pf',
    'pgsql',
    'php',
    'plaintext',
    'pony',
    'powershell',
    'processing',
    'profile',
    'prolog',
    'properties',
    'protobuf',
    'puppet',
    'purebasic',
    'python',
    'q',
    'qml',
    'r',
    'reasonml',
    'rib',
    'roboconf',
    'routeros',
    'rsl',
    'ruleslanguage',
    'rust',
    'sas',
    'scala',
    'scheme',
    'scilab',
    'scss',
    'shell',
    'smali',
    'smalltalk',
    'sml',
    'sqf',
    'sql',
    'stan',
    'stata',
    'step21',
    'stylus',
    'subunit',
    'swift',
    'taggerscript',
    'yaml',
    'tap',
    'tcl',
    'tex',
    'thrift',
    'tp',
    'twig',
    'typescript',
    'vala',
    'vbnet',
    'vbscript',
    'vbscript-html',
    'verilog',
    'vhdl',
    'vim',
    'x86asm',
    'xl',
    'xquery',
    'zephir'
  ]
  t.deepEqual(low.listLanguages(), expectedLanguages)

  low.registerLanguage('--test-lang--', function() {
    return {}
  })
  t.deepEqual(low.listLanguages(), expectedLanguages.concat(['--test-lang--']))

  t.end()
})

test('aliases', function(t) {
  var input = fs
    .readFileSync(join(fixtures, 'md-sublanguage', inputName))
    .toString()
    .trim()
  var expected = low.highlight('markdown', input).value

  low.registerAlias('markdown', 'mkd')

  t.deepEqual(
    low.highlight('mkd', input).value,
    expected,
    'alias must be parsed like original language'
  )

  low.registerAlias('markdown', ['mmkd', 'mmkdown'])

  t.deepEqual(
    low.highlight('mmkd', input).value,
    expected,
    'alias must be parsed like original language'
  )

  low.registerAlias({markdown: 'mdown'})

  t.deepEqual(
    low.highlight('mdown', input).value,
    expected,
    'alias must be parsed like original language'
  )

  low.registerAlias({markdown: ['mmdown', 'mark']})

  t.deepEqual(
    low.highlight('mark', input).value,
    expected,
    'alias must be parsed like original language'
  )

  low.registerAlias('markdown', '')

  t.throws(
    function() {
      low.highlight('', '')
    },
    /Unknown language: `` is not registered/,
    'empty language was not registered'
  )
  t.end()
})

function subtest(t, directory, transform) {
  var parts = directory.split('-')
  var language = parts[0]
  var name = parts.slice(1).join('-')
  var input = join(fixtures, directory, inputName)
  var output = join(fixtures, directory, outputName)

  var actual = transform(String(fs.readFileSync(input)).trim(), language)
  var expected = rehype()
    .data('settings', {fragment: true})
    .parse(String(fs.readFileSync(output)).trim())

  removePosition(expected, true)

  t.deepEqual(
    actual.value,
    expected.children,
    'should correctly process ' + name + ' in ' + language
  )
}
