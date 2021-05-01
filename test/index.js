/**
 * @typedef {import('tape').Test} Test
 * @typedef {import('hast').Root} Root
 * @typedef {import('../lib/core.js').LowlightRoot} LowlightRoot
 */

import fs from 'fs'
import path from 'path'
import highlight from 'highlight.js'
import test from 'tape'
import rehype from 'rehype'
import {removePosition} from 'unist-util-remove-position'
import {lowlight} from '../index.js'

var fixtures = path.join('test', 'fixture')
var inputName = 'input.txt'
var outputName = 'output.txt'

test('lowlight.highlight(language, value[, options])', function (t) {
  var result = lowlight.highlight('js', '')

  t.throws(
    function () {
      // @ts-ignore runtime.
      lowlight.highlight(true)
    },
    /Expected `string` for name, got `true`/,
    'should throw when not given `string` for `name`'
  )

  t.throws(
    function () {
      // @ts-ignore runtime.
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

  t.equal(
    result.data.relevance,
    0,
    'should return a `0` for `data.relevance` when empty'
  )

  t.deepEqual(
    result.children,
    [],
    'should return an empty array for `children` when empty'
  )

  t.deepEqual(
    lowlight.highlight('js', '# foo').children,
    [{type: 'text', value: '# foo'}],
    'should silently ignore illegals'
  )

  t.deepEqual(
    lowlight.highlight('js', '# foo').children,
    [{type: 'text', value: '# foo'}],
    'should silently ignore illegals'
  )

  t.test('fixture', function (t) {
    var result = lowlight.highlight(
      'java',
      ['public void moveTo(int x, int y, int z);'].join('\n')
    )

    t.equal(
      result.data.relevance,
      6,
      'should return the correct relevance for the fixture'
    )

    t.equal(
      result.data.language,
      'java',
      'should return the correct language for the fixture'
    )

    t.deepEqual(
      result.children,
      [
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
          properties: {className: ['hljs-title', 'hljs-function']},
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
              properties: {className: ['hljs-type']},
              children: [{type: 'text', value: 'int'}]
            },
            {type: 'text', value: ' x, '},
            {
              type: 'element',
              tagName: 'span',
              properties: {className: ['hljs-type']},
              children: [{type: 'text', value: 'int'}]
            },
            {type: 'text', value: ' y, '},
            {
              type: 'element',
              tagName: 'span',
              properties: {className: ['hljs-type']},
              children: [{type: 'text', value: 'int'}]
            },
            {type: 'text', value: ' z)'}
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
      // @ts-ignore yep, it’s an element.
      result.children[0].properties.className,
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
      // @ts-ignore yep, it’s an element.
      result.children[0].properties.className,
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
      // @ts-ignore runtime.
      lowlight.highlightAuto(true)
    },
    /Expected `string` for value, got `true`/,
    'should throw when not given a string'
  )

  t.equal(
    result.data.relevance,
    0,
    'should return a `0` for `relevance` when empty'
  )

  t.equal(
    result.data.language,
    null,
    'should return `null` for `language` when empty'
  )

  t.deepEqual(
    result.children,
    [],
    'should return an empty array for `children` when empty'
  )

  t.test('fixture', function (t) {
    var result = lowlight.highlightAuto(['"use strict";'].join('\n'))

    t.equal(
      result.data.relevance,
      10,
      'should return the correct relevance for the fixture'
    )

    t.equal(
      result.data.language,
      'javascript',
      'should return the correct language for the fixture'
    )

    t.deepEqual(
      result.children,
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
      // @ts-ignore yep, it’s an element.
      result.children[0].properties.className,
      ['foo-meta'],
      'should support a given custom `prefix`'
    )

    t.end()
  })

  t.test('empty `prefix`', function (t) {
    var result = lowlight.highlightAuto('"use strict";', {prefix: ''})

    t.deepEqual(
      // @ts-ignore yep, it’s an element.
      result.children[0].properties.className,
      ['meta'],
      'should support an empty `prefix`'
    )

    t.end()
  })

  t.test('custom `subset`', function (t) {
    var result = lowlight.highlightAuto('"use strict";', {subset: ['java']})

    t.equal(
      result.data.language,
      'java',
      'should support a given custom `subset`'
    )

    t.doesNotThrow(function () {
      result = lowlight.highlightAuto('"use strict";', {
        subset: ['fooscript', 'javascript']
      })
    }, 'should ignore unregistered subset languages (#1)')

    t.equal(
      result.data.language,
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

test('getLanguage', function (t) {
  t.ok(lowlight.getLanguage('javascript'), 'JavaScript exists');
  t.notOk(lowlight.getLanguage('made-up'), 'only registered languages are returned');

  t.end();
})

test('listLanguages', function (t) {
  var expectedLanguages = highlight.listLanguages()
  var mockName = 'testtest'

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
    return {contains: []}
  }

  t.end()
})

test('aliases', function (t) {
  var input = fs
    .readFileSync(path.join(fixtures, 'md-sublanguage', inputName))
    .toString()
    .trim()
  var expected = lowlight.highlight('markdown', input).children

  lowlight.registerAlias('markdown', 'mkd')

  t.deepEqual(
    lowlight.highlight('mkd', input).children,
    expected,
    'alias must be parsed like original language'
  )

  lowlight.registerAlias('markdown', ['mmkd', 'mmkdown'])

  t.deepEqual(
    lowlight.highlight('mmkd', input).children,
    expected,
    'alias must be parsed like original language'
  )

  lowlight.registerAlias({markdown: 'mdown'})

  t.deepEqual(
    lowlight.highlight('mdown', input).children,
    expected,
    'alias must be parsed like original language'
  )

  lowlight.registerAlias({markdown: ['mmdown', 'mark']})

  t.deepEqual(
    lowlight.highlight('mark', input).children,
    expected,
    'alias must be parsed like original language'
  )

  lowlight.registerAlias('markdown', '')

  t.end()
})

/**
 * @param {Test} t
 * @param {string} directory
 * @param {(doc: string, name: string) => LowlightRoot} transform
 */
function subtest(t, directory, transform) {
  var parts = directory.split('-')
  var language = parts[0]
  var name = parts.slice(1).join('-')
  var input = path.join(fixtures, directory, inputName)
  var output = path.join(fixtures, directory, outputName)
  /** @type {string} */
  var out

  var actual = transform(String(fs.readFileSync(input)).trim(), language)

  // Create output snapshot if it doesn’t exist yet.
  try {
    if ('UPDATE' in process.env) {
      throw new Error('Updating…')
    }

    out = String(fs.readFileSync(output))
  } catch {
    out =
      rehype()
        .data('settings', {
          fragment: true,
          entities: {useNamedReferences: true}
        })
        .stringify(actual) + '\n'

    fs.writeFileSync(output, out)
  }

  var expected = rehype().data('settings', {fragment: true}).parse(out.trim())

  removePosition(expected, true)

  t.deepEqual(
    actual.children,
    expected.children,
    'should correctly process ' + name + ' in ' + language
  )
}
