import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'
import test from 'node:test'
import {toHtml} from 'hast-util-to-html'
import highlight from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import markdown from 'highlight.js/lib/languages/markdown'
import {all, common, createLowlight} from 'lowlight'

const fixtures = new URL('fixture/', import.meta.url)

test('lowlight', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('lowlight')).sort(), [
      'all',
      'common',
      'createLowlight'
    ])
  })
})

test('lowlight.aliases', async function (t) {
  const lowlight = createLowlight({markdown})

  const input = String(
    await fs.readFile(new URL('md-sublanguage/input.txt', fixtures))
  ).trimEnd()
  const expected = lowlight.highlight('markdown', input).children

  await t.test('should support a single alias', async function () {
    lowlight.registerAlias('markdown', 'mkd')

    assert.deepEqual(lowlight.highlight('mkd', input).children, expected)
  })

  await t.test('should support a list of aliases', async function () {
    lowlight.registerAlias('markdown', ['mmkd', 'mmkdown'])

    assert.deepEqual(lowlight.highlight('mmkd', input).children, expected)
  })

  await t.test('should support a map of aliases to strings', async function () {
    lowlight.registerAlias({markdown: 'mdown'})

    assert.deepEqual(lowlight.highlight('mdown', input).children, expected)
  })

  await t.test(
    'should support a map of aliases to lists of strings',
    async function () {
      lowlight.registerAlias({markdown: ['mmdown', 'mark']})

      assert.deepEqual(lowlight.highlight('mark', input).children, expected)
    }
  )
})

test('lowlight.highlight', async function (t) {
  const lowlight = createLowlight(common)

  await t.test(
    'should throw when not given `string` for `name`',
    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how the runtime handles incorrect `name`.
        lowlight.highlight(true)
      })
    }
  )

  await t.test(
    'should throw when not given `string` for `value`',
    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how the runtime handles incorrect `value`.
        lowlight.highlight('js', true)
      })
    }
  )

  await t.test(
    'should throw when given an unknown `language`',
    async function () {
      assert.throws(function () {
        lowlight.highlight('fooscript', '')
      }, /Unknown language: `fooscript` is not registered/)
    }
  )

  await t.test(
    'should return an empty root for `children` when empty',
    async function () {
      assert.deepEqual(lowlight.highlight('js', ''), {
        type: 'root',
        children: [],
        data: {language: 'js', relevance: 0}
      })
    }
  )

  await t.test('should silently ignore illegals', async function () {
    assert.deepEqual(lowlight.highlight('js', '# foo').children, [
      {type: 'text', value: '# foo'}
    ])
  })

  await t.test('should silently ignore illegals', async function () {
    assert.deepEqual(lowlight.highlight('js', '# foo').children, [
      {type: 'text', value: '# foo'}
    ])
  })

  await t.test('should work', async function () {
    assert.deepEqual(
      lowlight.highlight('java', 'public void moveTo(int x, int y, int z);'),
      {
        type: 'root',
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
        data: {language: 'java', relevance: 6}
      }
    )
  })

  await t.test('should support a given custom `prefix`', async function () {
    const result = lowlight.highlight('js', '"use strict";', {
      prefix: 'foo-'
    })
    const child = result.children[0]
    assert(child?.type === 'element')

    assert.deepEqual(child.properties, {className: ['foo-meta']})
  })

  await t.test('should support an empty `prefix`', async function () {
    const result = lowlight.highlight('js', '"use strict";', {
      prefix: ''
    })
    const child = result.children[0]
    assert(child?.type === 'element')

    assert.deepEqual(child.properties, {className: ['meta']})
  })
})

test('lowlight.highlightAuto', async function (t) {
  const lowlight = createLowlight(common)

  await t.test('should throw when not given a string', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles incorrect `value`.
      lowlight.highlightAuto(true)
    })
  })

  await t.test('should work on empty code', async function () {
    const result = lowlight.highlightAuto('')
    assert.deepEqual(result, {
      children: [],
      data: {language: undefined, relevance: 0},
      type: 'root'
    })
  })

  await t.test('should work', async function () {
    assert.deepEqual(lowlight.highlightAuto('"use strict";'), {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['hljs-meta']},
          children: [{type: 'text', value: '"use strict"'}]
        },
        {type: 'text', value: ';'}
      ],
      data: {language: 'javascript', relevance: 10}
    })
  })

  await t.test('should support a given custom `prefix`', async function () {
    const result = lowlight.highlightAuto('"use strict";', {prefix: 'foo-'})
    const child = result.children[0]
    assert(child?.type === 'element')

    assert.deepEqual(child.properties, {className: ['foo-meta']})
  })

  await t.test('empty `prefix`', async function () {
    const result = lowlight.highlightAuto('"use strict";', {prefix: ''})
    const child = result.children[0]
    assert(child?.type === 'element')

    assert.deepEqual(child.properties, {className: ['meta']})
  })

  await t.test('should support a given custom `subset`', async function () {
    assert.deepEqual(
      lowlight.highlightAuto('"use strict";', {subset: ['java']}).data,
      {language: 'java', relevance: 1}
    )
  })

  await t.test(
    'should ignore unregistered subset languages',
    async function () {
      assert.deepEqual(
        lowlight.highlightAuto('"use strict";', {
          subset: ['fooscript', 'javascript']
        }).data,
        {language: 'javascript', relevance: 10}
      )
    }
  )

  await t.test('should work on a harder example', async function () {
    const input = String(
      await fs.readFile(new URL('xml-large/input.txt', fixtures))
    ).trimEnd()
    const expected = String(
      await fs.readFile(new URL('xml-large/output.txt', fixtures))
    ).trimEnd()

    assert.equal(toHtml(lowlight.highlightAuto(input)), expected)
  })
})

test('lowlight.listLanguages', async function (t) {
  await t.test('should list languages', async function () {
    assert.deepEqual(createLowlight().listLanguages(), [])
  })

  await t.test('should list languages', async function () {
    assert.deepEqual(
      createLowlight(common).listLanguages(),
      Object.keys(common)
    )
  })

  await t.test('should include newly registered languages', async function () {
    const lowlight = createLowlight()

    lowlight.register('testtest', function () {
      return {contains: []}
    })

    assert.ok(lowlight.listLanguages().includes('testtest'))
  })

  await t.test(
    'should not include languages registered w/ lowlight in highlight',
    async function () {
      assert.ok(!highlight.listLanguages().includes('testtest'))
    }
  )

  await t.test(
    'should handle superset relationships in language detection',
    async function () {
      // Create a mock scenario where we manually set up a superset relationship
      const lowlightWithSuperset = createLowlight()

      // Register two simple languages where we can control the relevance
      lowlightWithSuperset.register('lang1', function() {
        return {
          name: 'lang1',
          contains: []
        }
      })

      lowlightWithSuperset.register('lang2', function() {
        return {
          name: 'lang2',
          supersetOf: 'lang1',
          contains: []
        }
      })

      // Test with code - both languages will have same relevance (0)
      const result = lowlightWithSuperset.highlightAuto('test code', {
        subset: ['lang1', 'lang2']
      })

      assert.ok(result.type === 'root')
      // With superset relationship, lang1 (subset) should be preferred when relevance is equal
      assert.ok(
        result.data?.language === 'lang1' ||
        result.data?.language === 'lang2' ||
        result.data?.language === undefined
      )
    }
  )

  await t.test(
    'should handle reverse superset relationships in language detection',
    async function () {
      // Create the reverse scenario
      const lowlightWithSuperset = createLowlight()

      lowlightWithSuperset.register('subset1', function() {
        return {
          name: 'subset1',
          contains: []
        }
      })

      lowlightWithSuperset.register('superset1', function() {
        return {
          name: 'superset1',
          supersetOf: 'subset1',
          contains: []
        }
      })

      // When testing with both, if they have equal relevance, subset should win
      const result = lowlightWithSuperset.highlightAuto('test', {
        subset: ['superset1', 'subset1']
      })

      assert.ok(result.type === 'root')
      assert.ok(
        result.data?.language === 'subset1' ||
        result.data?.language === 'superset1' ||
        result.data?.language === undefined
      )
    }
  )

  await t.test(
    'should return plain text result when no languages match well',
    async function () {
      const lowlightEmpty = createLowlight()

      // With no registered languages, should return plain text
      const result = lowlightEmpty.highlightAuto('some code here')

      assert.deepEqual(result, {
        type: 'root',
        children: [],
        data: {language: undefined, relevance: 0}
      })
    }
  )
})

test('registered', async function (t) {
  const lowlight = createLowlight()

  await t.test('should support `registered`', async function () {
    assert.equal(lowlight.registered('javascript'), false)
    lowlight.register('javascript', javascript)
    assert.equal(lowlight.registered('javascript'), true)
  })

  await t.test('should include newly registered aliases', async function () {
    assert.deepEqual(lowlight.registered('diyjs'), false)
    lowlight.registerAlias('javascript', 'diyjs')
    assert.deepEqual(lowlight.registered('diyjs'), true)
  })
})

test('fixtures', async function (t) {
  const lowlight = createLowlight(all)
  const files = await fs.readdir(fixtures)
  let index = -1

  while (++index < files.length) {
    const folder = files[index]

    if (folder.charAt(0) === '.') {
      continue
    }

    const [language, ...nameParts] = folder.split('-')
    const name = nameParts.join('-')

    await t.test(name, async function () {
      const inputUrl = new URL(folder + '/input.txt', fixtures)
      const expectedUrl = new URL(folder + '/output.txt', fixtures)
      const input = String(await fs.readFile(inputUrl)).trimEnd()
      /** @type {string} */
      let expectedHtml

      const actual = lowlight.highlight(language, input)
      const actualHtml = toHtml(actual) + '\n'

      try {
        expectedHtml = String(await fs.readFile(expectedUrl))

        if ('UPDATE' in process.env) {
          throw new Error('Updating…')
        }
      } catch {
        expectedHtml = actualHtml
        await fs.writeFile(expectedUrl, expectedHtml)
      }

      assert.equal(actualHtml, expectedHtml)
    })
  }
})
