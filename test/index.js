/**
 * @typedef {import('../lib/core.js').Root} Root
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'
import test, {beforeEach, mock} from 'node:test'
import highlight from 'highlight.js/lib/core'
import coffeescript from 'highlight.js/lib/languages/coffeescript'
import haskell from 'highlight.js/lib/languages/haskell'
import http from 'highlight.js/lib/languages/http'
import pgsql from 'highlight.js/lib/languages/pgsql'
import {rehype} from 'rehype'
import {removePosition} from 'unist-util-remove-position'
import {lowlight} from '../index.js'

// Register test language which are not covered by lib/common.js
lowlight.registerLanguage('coffee', coffeescript)
lowlight.registerLanguage('haskell', haskell)
lowlight.registerLanguage('http', http)
lowlight.registerLanguage('pgsql', pgsql)

/* eslint-disable no-await-in-loop */

const fixtures = new URL('fixture/', import.meta.url)

beforeEach(() => {
  mock.reset()
  mock.method(highlight, 'configure')
})

test('lowlight.highlight(language, value[, options])', async (t) => {
  const result = lowlight.highlight('js', '')

  assert.throws(
    () => {
      // @ts-expect-error runtime.
      lowlight.highlight(true)
    },
    /Expected `string` for name, got `true`/,
    'should throw when not given `string` for `name`'
  )

  assert.throws(
    () => {
      // @ts-expect-error runtime.
      lowlight.highlight('js', true)
    },
    /Expected `string` for value, got `true`/,
    'should throw when not given `string` for `value`'
  )

  assert.throws(
    () => {
      lowlight.highlight('fooscript', '')
    },
    /Unknown language: `fooscript` is not registered/,
    'should throw when given an unknown `language`'
  )

  assert.equal(
    // @ts-expect-error mocked function
    highlight.configure.mock.calls.length,
    0,
    'should not call the global configure method'
  )

  assert.equal(
    result.data.relevance,
    0,
    'should return a `0` for `data.relevance` when empty'
  )

  assert.deepEqual(
    result.children,
    [],
    'should return an empty array for `children` when empty'
  )

  assert.deepEqual(
    lowlight.highlight('js', '# foo').children,
    [{type: 'text', value: '# foo'}],
    'should silently ignore illegals'
  )

  assert.deepEqual(
    lowlight.highlight('js', '# foo').children,
    [{type: 'text', value: '# foo'}],
    'should silently ignore illegals'
  )

  await t.test('fixture', () => {
    const result = lowlight.highlight(
      'java',
      ['public void moveTo(int x, int y, int z);'].join('\n')
    )

    assert.equal(
      result.data.relevance,
      6,
      'should return the correct relevance for the fixture'
    )

    assert.equal(
      result.data.language,
      'java',
      'should return the correct language for the fixture'
    )

    assert.deepEqual(
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
          properties: {className: ['hljs-title', 'function_']},
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
  })

  await t.test('custom `prefix`', () => {
    const result = lowlight.highlight('js', '"use strict";', {
      prefix: 'foo-'
    })

    assert.deepEqual(
      // @ts-expect-error yep, it’s an element.
      result.children[0].properties.className,
      ['foo-meta'],
      'should support a given custom `prefix`'
    )
  })

  await t.test('empty `prefix`', () => {
    const result = lowlight.highlight('js', '"use strict";', {
      prefix: ''
    })

    assert.deepEqual(
      // @ts-expect-error yep, it’s an element.
      result.children[0].properties.className,
      ['meta'],
      'should support an empty `prefix`'
    )
  })
})

test('lowlight.highlightAuto(value[, options])', async (t) => {
  const result = lowlight.highlightAuto('')

  assert.throws(
    () => {
      // @ts-expect-error runtime.
      lowlight.highlightAuto(true)
    },
    /Expected `string` for value, got `true`/,
    'should throw when not given a string'
  )

  assert.equal(
    result.data.relevance,
    0,
    'should return a `0` for `relevance` when empty'
  )

  assert.equal(
    result.data.language,
    null,
    'should return `null` for `language` when empty'
  )

  assert.deepEqual(
    result.children,
    [],
    'should return an empty array for `children` when empty'
  )

  await t.test('fixture', () => {
    const result = lowlight.highlightAuto(['"use strict";'].join('\n'))

    assert.equal(
      result.data.relevance,
      10,
      'should return the correct relevance for the fixture'
    )

    assert.equal(
      result.data.language,
      'javascript',
      'should return the correct language for the fixture'
    )

    assert.deepEqual(
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
  })

  await t.test('custom `prefix`', () => {
    const result = lowlight.highlightAuto('"use strict";', {prefix: 'foo-'})

    assert.deepEqual(
      // @ts-expect-error yep, it’s an element.
      result.children[0].properties.className,
      ['foo-meta'],
      'should support a given custom `prefix`'
    )
  })

  await t.test('empty `prefix`', () => {
    const result = lowlight.highlightAuto('"use strict";', {prefix: ''})

    assert.deepEqual(
      // @ts-expect-error yep, it’s an element.
      result.children[0].properties.className,
      ['meta'],
      'should support an empty `prefix`'
    )
  })

  await t.test('custom `subset`', () => {
    let result = lowlight.highlightAuto('"use strict";', {subset: ['java']})

    assert.equal(
      result.data.language,
      'java',
      'should support a given custom `subset`'
    )

    assert.doesNotThrow(() => {
      result = lowlight.highlightAuto('"use strict";', {
        subset: ['fooscript', 'javascript']
      })
    }, 'should ignore unregistered subset languages (#1)')

    assert.equal(
      result.data.language,
      'javascript',
      'should ignore unregistered subset languages (#2)'
    )
  })

  await t.test('harder example (coverage)', async () => {
    await subtest('xml-large', (doc) => lowlight.highlightAuto(doc))
  })
})

test('fixtures', async () => {
  const files = await fs.readdir(fixtures)
  let index = -1

  while (++index < files.length) {
    if (files[index].charAt(0) !== '.') {
      await subtest(files[index], (doc, language) =>
        lowlight.highlight(language, doc)
      )
    }
  }
})

test('listLanguages', () => {
  const mockName = 'testtest'

  lowlight.registerLanguage(mockName, mockSyntax)

  assert.ok(
    lowlight.listLanguages().includes(mockName),
    'should include any additional languages that are registered'
  )

  assert.ok(
    !highlight.listLanguages().includes(mockName),
    'should *not* include any additional languages that are registered at lowlight'
  )

  function mockSyntax() {
    return {contains: []}
  }
})

test('aliases', async () => {
  const input = String(
    await fs.readFile(new URL('md-sublanguage/input.txt', fixtures))
  ).trim()
  const expected = lowlight.highlight('markdown', input).children

  lowlight.registerAlias('markdown', 'mkd')

  assert.deepEqual(
    lowlight.highlight('mkd', input).children,
    expected,
    'alias must be parsed like original language'
  )

  lowlight.registerAlias('markdown', ['mmkd', 'mmkdown'])

  assert.deepEqual(
    lowlight.highlight('mmkd', input).children,
    expected,
    'alias must be parsed like original language'
  )

  lowlight.registerAlias({markdown: 'mdown'})

  assert.deepEqual(
    lowlight.highlight('mdown', input).children,
    expected,
    'alias must be parsed like original language'
  )

  lowlight.registerAlias({markdown: ['mmdown', 'mark']})

  assert.deepEqual(
    lowlight.highlight('mark', input).children,
    expected,
    'alias must be parsed like original language'
  )

  lowlight.registerAlias('markdown', '')
})

test('registered', () => {
  assert.deepEqual(lowlight.registered('javascript'), true)
  assert.deepEqual(lowlight.registered('diyjs'), false)

  lowlight.registerAlias('javascript', 'diyjs')

  assert.deepEqual(lowlight.registered('diyjs'), true)

  lowlight.registerAlias('javascript', '')
})

/**
 * @param {string} directory
 * @param {(doc: string, name: string) => Root} transform
 */
async function subtest(directory, transform) {
  const parts = directory.split('-')
  const language = parts[0]
  const name = parts.slice(1).join('-')
  const input = new URL(directory + '/input.txt', fixtures)
  const output = new URL(directory + '/output.txt', fixtures)
  /** @type {string} */
  let out

  const actual = transform(String(await fs.readFile(input)).trim(), language)

  // Create output snapshot if it doesn’t exist yet.
  try {
    if ('UPDATE' in process.env) {
      throw new Error('Updating…')
    }

    out = String(await fs.readFile(output))
  } catch {
    out =
      rehype()
        .data('settings', {
          fragment: true,
          entities: {useNamedReferences: true}
        })
        .stringify(actual) + '\n'

    await fs.writeFile(output, out)
  }

  const expected = rehype().data('settings', {fragment: true}).parse(out.trim())

  removePosition(expected, true)

  assert.deepEqual(
    actual.children,
    expected.children,
    'should correctly process ' + name + ' in ' + language
  )
}

/* eslint-enable no-await-in-loop */
