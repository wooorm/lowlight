/**
 * @typedef {import('highlight.js').LanguageFn} LanguageFn
 *
 * @typedef {import('mdast').ListItem} ListItem
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('mdast').Root} Root
 */

import fs from 'node:fs/promises'
import hljs from 'highlight.js'
import {zone} from 'mdast-zone'

/** @type {{common: Array<string>, uncommon: Array<string>}} */
const data = JSON.parse(
  String(await fs.readFile(new URL('data.json', import.meta.url)))
)

const items = await Promise.all(
  [...data.common, ...data.uncommon]
    .sort(function (a, b) {
      return a.localeCompare(b)
    })
    .map(function (d) {
      return item(d)
    })
)

/**
 * Generate support.
 *
 * @returns
 *   Transform.
 */
export default function support() {
  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @returns {Promise<undefined>}
   *   Nothing.
   */
  return async function (tree) {
    zone(tree, 'support', function (start, _, end) {
      return [start, {type: 'list', spread: false, children: items}, end]
    })
  }
}

/**
 * @param {string} name
 *   Name.
 * @returns {Promise<ListItem>}
 *   List item.
 */
async function item(name) {
  /** @type {{default: LanguageFn}} */
  const mod = await import('highlight.js/lib/languages/' + name)
  const fn = mod.default
  const language = fn(hljs)
  /** @type {Array<PhrasingContent>} */
  const content = [{type: 'inlineCode', value: name}]
  let index = -1

  if (language.aliases) {
    content.push({type: 'text', value: ' ('})

    while (++index < language.aliases.length) {
      if (index) content.push({type: 'text', value: ', '})
      content.push({type: 'inlineCode', value: language.aliases[index]})
    }

    content.push({type: 'text', value: ')'})
  }

  content.push({type: 'text', value: ' — ' + language.name})

  return {
    type: 'listItem',
    checked: data.common.includes(name),
    children: [{type: 'paragraph', children: content}]
  }
}
