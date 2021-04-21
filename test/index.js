import fs from 'fs'
import path from 'path'
import highlight from 'highlight.js'
import test from 'tape'
import rehype from 'rehype'
import {removePosition} from 'unist-util-remove-position'
import {lowlight} from '../index.js'

var join = path.join

var fixtures = path.join('test', 'fixture')
var inputName = 'input.txt'
var outputName = 'output.txt'

test('lowlight.highlight(language, value[, options])', function (t) {
  var result = lowlight.highlight('js', '')

  t.throws(
    function () {
      lowlight.highlight(true)
    },
    /Expected `string` for name, got `true`/,
    'should throw when not given `string` for `name`'
  )

  t.throws(
    function () {
      lowlight.highlight('js', true)
    },
    /Expected `string` for value, got `true`/,
    'should throw when not given `string` for `value`'
  )

  t.throws(
    function () {
      lowlight.highlight('fooscript', '')
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
    lowlight.highlight('js', '# foo').value,
    [{type: 'text', value: '# foo'}],
    'should silently ignore illegals'
  )

  t.deepEqual(
    lowlight.highlight('js', '# foo', {ignore: true}).value,
    [{type: 'text', value: '# foo'}],
    'should silently ignore illegals'
  )

  t.test('fixture', function (t) {
    var result = lowlight.highlight(
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
    var result = lowlight.highlight('js', '"use strict";', {
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
    var result = lowlight.highlight('js', '"use strict";', {
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

test('lowlight.highlightAuto(value[, options])', function (t) {
  var result = lowlight.highlightAuto('')

  t.throws(
    function () {
      lowlight.highlightAuto(true)
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
    var result = lowlight.highlightAuto(['"use strict";'].join('\n'))

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
      'typescript',
      'should return a `secondBest` `language`'
    )

    t.equal(
      result.secondBest.relevance,
      10,
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
    var result = lowlight.highlightAuto('"use strict";', {prefix: 'foo-'})

    t.deepEqual(
      result.value[0].properties.className,
      ['foo-meta'],
      'should support a given custom `prefix`'
    )

    t.end()
  })

  t.test('empty `prefix`', function (t) {
    var result = lowlight.highlightAuto('"use strict";', {prefix: ''})

    t.deepEqual(
      result.value[0].properties.className,
      ['meta'],
      'should support an empty `prefix`'
    )

    t.end()
  })

  t.test('custom `subset`', function (t) {
    var result = lowlight.highlightAuto('"use strict";', {subset: ['java']})

    t.equal(result.language, 'java', 'should support a given custom `subset`')

    t.doesNotThrow(function () {
      result = lowlight.highlightAuto('"use strict";', {
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
      return lowlight.highlightAuto(doc)
    })

    t.end()
  })

  t.end()
})

test('fixtures', function (t) {
  var files = fs.readdirSync(fixtures)
  var index = -1

  while (++index < files.length) {
    if (files[index].charAt(0) !== '.') {
      subtest(t, files[index], function (doc, language) {
        return lowlight.highlight(language, doc)
      })
    }
  }

  t.end()
})

test('listLanguages', function (t) {
  var expectedLanguages = highlight.listLanguages()
  var mockName = 'testtest'

  // If this test fails, update `readme.md`.
  t.equal(expectedLanguages.length, 191, 'should match `readme.md`')

  t.deepEqual(
    lowlight.listLanguages(),
    expectedLanguages,
    'should return the same list of languages as highlight.js'
  )

  lowlight.registerLanguage(mockName, mockSyntax)

  t.ok(
    lowlight.listLanguages().includes(mockName),
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
  var expected = lowlight.highlight('markdown', input).value

  lowlight.registerAlias('markdown', 'mkd')

  t.deepEqual(
    lowlight.highlight('mkd', input).value,
    expected,
    'alias must be parsed like original language'
  )

  lowlight.registerAlias('markdown', ['mmkd', 'mmkdown'])

  t.deepEqual(
    lowlight.highlight('mmkd', input).value,
    expected,
    'alias must be parsed like original language'
  )

  lowlight.registerAlias({markdown: 'mdown'})

  t.deepEqual(
    lowlight.highlight('mdown', input).value,
    expected,
    'alias must be parsed like original language'
  )

  lowlight.registerAlias({markdown: ['mmdown', 'mark']})

  t.deepEqual(
    lowlight.highlight('mark', input).value,
    expected,
    'alias must be parsed like original language'
  )

  lowlight.registerAlias('markdown', '')

  t.throws(
    function () {
      lowlight.highlight('', '')
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
  } catch {
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
