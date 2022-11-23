/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').ListItem} ListItem
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('highlight.js').LanguageFn} LanguageFn
 */

import fs from 'node:fs/promises'
import hljs from 'highlight.js'
import {zone} from 'mdast-zone'
import {u} from 'unist-builder'

/** @type {{common: Array<string>, uncommon: Array<string>}} */
const data = JSON.parse(
  String(await fs.readFile(new URL('data.json', import.meta.url)))
)

const promises = Promise.all(
  [...data.common, ...data.uncommon]
    .sort((a, b) => a.localeCompare(b))
    .map((d) => item(d))
)

/** @type {import('unified').Plugin<[], Root>} */
export default function support() {
  return async function (tree) {
    const items = await promises

    zone(tree, 'support', (start, _, end) => [
      start,
      u('list', {spread: false}, items),
      end
    ])
  }
}

/**
 * @param {string} name
 * @returns {Promise<ListItem>}
 */
async function item(name) {
  /** @type {{default: LanguageFn}} */
  // type-coverage:ignore-next-line
  const mod = await import('highlight.js/lib/languages/' + name)
  const fn = mod.default
  const language = fn(hljs)
  /** @type {Array<PhrasingContent>} */
  const content = [u('inlineCode', name)]
  let index = -1

  if (language.aliases) {
    content.push(u('text', ' ('))

    while (++index < language.aliases.length) {
      if (index) content.push(u('text', ', '))
      content.push(u('inlineCode', language.aliases[index]))
    }

    content.push(u('text', ')'))
  }

  content.push(u('text', ' — ' + language.name))

  return u('listItem', {checked: data.common.includes(name)}, [
    u('paragraph', content)
  ])
}
