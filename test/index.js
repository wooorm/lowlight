/**
 * @typedef {import('tape').Test} Test
 * @typedef {import('../lib/core.js').LowlightRoot} LowlightRoot
 */

import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import highlight from 'highlight.js'
import test from 'tape'
import {rehype} from 'rehype'
import {removePosition} from 'unist-util-remove-position'
import {lowlight} from '../index.js'

const fixtures = path.join('test', 'fixture')
const inputName = 'input.txt'
const outputName = 'output.txt'

test('lowlight.highlight(language, value[, options])', (t) => {
  const result = lowlight.highlight('js', '')

  t.throws(
    () => {
      // @ts-expect-error runtime.
      lowlight.highlight(true)
    },
    /Expected `string` for name, got `true`/,
    'should throw when not given `string` for `name`'
  )

  t.throws(
    () => {
      // @ts-expect-error runtime.
      lowlight.highlight('js', true)
    },
    /Expected `string` for value, got `true`/,
    'should throw when not given `string` for `value`'
  )

  t.throws(
    () => {
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

  t.test('fixture', (t) => {
    const result = lowlight.highlight(
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

  t.test('custom `prefix`', (t) => {
    const result = lowlight.highlight('js', '"use strict";', {
      prefix: 'foo-'
    })

    t.deepEqual(
      // @ts-expect-error yep, it’s an element.
      result.children[0].properties.className,
      ['foo-meta'],
      'should support a given custom `prefix`'
    )

    t.end()
  })

  t.test('empty `prefix`', (t) => {
    const result = lowlight.highlight('js', '"use strict";', {
      prefix: ''
    })

    t.deepEqual(
      // @ts-expect-error yep, it’s an element.
      result.children[0].properties.className,
      ['meta'],
      'should support an empty `prefix`'
    )

    t.end()
  })

  t.end()
})

test('lowlight.highlightAuto(value[, options])', (t) => {
  const result = lowlight.highlightAuto('')

  t.throws(
    () => {
      // @ts-expect-error runtime.
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

  t.test('fixture', (t) => {
    const result = lowlight.highlightAuto(['"use strict";'].join('\n'))

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

  t.test('custom `prefix`', (t) => {
    const result = lowlight.highlightAuto('"use strict";', {prefix: 'foo-'})

    t.deepEqual(
      // @ts-expect-error yep, it’s an element.
      result.children[0].properties.className,
      ['foo-meta'],
      'should support a given custom `prefix`'
    )

    t.end()
  })

  t.test('empty `prefix`', (t) => {
    const result = lowlight.highlightAuto('"use strict";', {prefix: ''})

    t.deepEqual(
      // @ts-expect-error yep, it’s an element.
      result.children[0].properties.className,
      ['meta'],
      'should support an empty `prefix`'
    )

    t.end()
  })

  t.test('custom `subset`', (t) => {
    let result = lowlight.highlightAuto('"use strict";', {subset: ['java']})

    t.equal(
      result.data.language,
      'java',
      'should support a given custom `subset`'
    )

    t.doesNotThrow(() => {
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

  t.test('harder example (coverage)', (t) => {
    subtest(t, 'xml-large', (doc) => lowlight.highlightAuto(doc))

    t.end()
  })

  t.end()
})

test('fixtures', (t) => {
  const files = fs.readdirSync(fixtures)
  let index = -1

  while (++index < files.length) {
    if (files[index].charAt(0) !== '.') {
      subtest(t, files[index], (doc, language) =>
        lowlight.highlight(language, doc)
      )
    }
  }

  t.end()
})

test('listLanguages', (t) => {
  const expectedLanguages = highlight.listLanguages()
  const mockName = 'testtest'

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

test('aliases', (t) => {
  const input = fs
    .readFileSync(path.join(fixtures, 'md-sublanguage', inputName))
    .toString()
    .trim()
  const expected = lowlight.highlight('markdown', input).children

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

test('registered', (t) => {
  t.deepEqual(lowlight.registered('javascript'), true)
  t.deepEqual(lowlight.registered('diyjs'), false)

  lowlight.registerAlias('javascript', 'diyjs')

  t.deepEqual(lowlight.registered('diyjs'), true)

  lowlight.registerAlias('javascript', '')
  t.end()
})

/**
 * @param {Test} t
 * @param {string} directory
 * @param {(doc: string, name: string) => LowlightRoot} transform
 */
function subtest(t, directory, transform) {
  const parts = directory.split('-')
  const language = parts[0]
  const name = parts.slice(1).join('-')
  const input = path.join(fixtures, directory, inputName)
  const output = path.join(fixtures, directory, outputName)
  /** @type {string} */
  let out

  const actual = transform(String(fs.readFileSync(input)).trim(), language)

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

  const expected = rehype().data('settings', {fragment: true}).parse(out.trim())

  removePosition(expected, true)

  t.deepEqual(
    actual.children,
    expected.children,
    'should correctly process ' + name + ' in ' + language
  )
}
