'use strict'

var fs = require('fs')
var path = require('path')
var highlight = require('highlight.js')
var test = require('tape')
var rehype = require('rehype')
var removePosition = require('unist-util-remove-position')
var low = require('..')

var join = path.join

var fixtures = path.join(__dirname, 'fixture')
var inputName = 'input.txt'
var outputName = 'output.txt'

test('lowlight.highlight(language, value[, options])', function (t) {
  var result = low.highlight('js', '')

  t.throws(
    function () {
      low.highlight(true)
    },
    /Expected `string` for name, got `true`/,
    'should throw when not given `string` for `name`'
  )

  t.throws(
    function () {
      low.highlight('js', true)
    },
    /Expected `string` for value, got `true`/,
    'should throw when not given `string` for `value`'
  )

  t.throws(
    function () {
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

  t.test('fixture', function (t) {
    var result = low.highlight(
      'java',
      ['public void moveTo(int x, int y, int z);'].join('\n')
    )

    t.equal(
      result.relevance,
      6,
      'should return the correct relevance for the fixture'
    )

    t.equal(
      result.language,
      'java',
      'should return the correct language for the fixture'
    )

    t.deepEqual(
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

    t.end()
  })

  t.test('custom `prefix`', function (t) {
    var result = low.highlight('js', '"use strict";', {
      prefix: 'foo-'
    })

    t.deepEqual(
      result.value[0].properties.className,
      ['foo-meta'],
      'should support a given custom `prefix`'
    )

    t.end()
  })

  t.test('empty `prefix`', function (t) {
    var result = low.highlight('js', '"use strict";', {
      prefix: ''
    })

    t.deepEqual(
      result.value[0].properties.className,
      ['meta'],
      'should support an empty `prefix`'
    )

    t.end()
  })

  t.end()
})

test('lowlight(value[, options])', function (t) {
  var result = low.highlightAuto('')

  t.throws(
    function () {
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

  t.test('fixture', function (t) {
    var result = low.highlightAuto(['"use strict";'].join('\n'))

    t.equal(
      result.relevance,
      10,
      'should return the correct relevance for the fixture'
    )

    t.equal(
      result.language,
      'javascript',
      'should return the correct language for the fixture'
    )

    t.equal(
      typeof result.secondBest,
      'object',
      'should return a `secondBest` result'
    )

    t.equal(
      result.secondBest.language,
      'abnf',
      'should return a `secondBest` `language`'
    )

    t.equal(
      result.secondBest.relevance,
      2,
      'should return a `secondBest` `relevance`'
    )

    t.deepEqual(
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

    t.end()
  })

  t.test('custom `prefix`', function (t) {
    var result = low.highlightAuto('"use strict";', {prefix: 'foo-'})

    t.deepEqual(
      result.value[0].properties.className,
      ['foo-meta'],
      'should support a given custom `prefix`'
    )

    t.end()
  })

  t.test('empty `prefix`', function (t) {
    var result = low.highlightAuto('"use strict";', {prefix: ''})

    t.deepEqual(
      result.value[0].properties.className,
      ['meta'],
      'should support an empty `prefix`'
    )

    t.end()
  })

  t.test('custom `subset`', function (t) {
    var result = low.highlightAuto('"use strict";', {subset: ['java']})

    t.equal(result.language, 'java', 'should support a given custom `subset`')

    t.doesNotThrow(function () {
      result = low.highlightAuto('"use strict";', {
        subset: ['fooscript', 'javascript']
      })
    }, 'should ignore unregistered subset languages (#1)')

    t.equal(
      result.language,
      'javascript',
      'should ignore unregistered subset languages (#2)'
    )

    t.end()
  })

  t.test('harder example (coverage)', function (t) {
    subtest(t, 'xml-large', function (doc) {
      return low.highlightAuto(doc)
    })

    t.end()
  })

  t.end()
})

test('fixtures', function (t) {
  fs.readdirSync(fixtures).forEach(each)

  function each(basename) {
    if (basename.charAt(0) !== '.') {
      subtest(t, basename, function (doc, language) {
        return low.highlight(language, doc)
      })
    }
  }

  t.end()
})

test('listLanguages', function (t) {
  var expectedLanguages = highlight.listLanguages()
  var mockName = 'testtest'

  t.deepEqual(
    low.listLanguages(),
    expectedLanguages,
    'should return the same list of languages as highlight.js'
  )

  low.registerLanguage(mockName, mockSyntax)

  t.ok(
    low.listLanguages().includes(mockName),
    'should include any additional languages that are registered'
  )

  function mockSyntax() {
    return {}
  }

  t.end()
})

test('aliases', function (t) {
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
    function () {
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
  var out

  var actual = transform(String(fs.readFileSync(input)).trim(), language)

  // Create output snapshot if it doesn’t exist yet.
  try {
    out = fs.readFileSync(output)
  } catch (_) {
    out =
      rehype()
        .data('settings', {
          fragment: true,
          entities: {useNamedReferences: true}
        })
        .stringify({type: 'root', children: actual.value}) + '\n'

    fs.writeFileSync(output, out)
  }

  var expected = rehype()
    .data('settings', {fragment: true})
    .parse(String(out).trim())

  removePosition(expected, true)

  t.deepEqual(
    actual.value,
    expected.children,
    'should correctly process ' + name + ' in ' + language
  )
}
