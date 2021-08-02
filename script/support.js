/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('highlight.js').LanguageFn} LanguageFn
 */

import path from 'path'
import fs from 'fs'
import hljs from 'highlight.js'
import {zone} from 'mdast-zone'
import {u} from 'unist-builder'

/** @type {{common: string[], uncommon: string[]}} */
const data = JSON.parse(
  String(fs.readFileSync(path.join('script', 'data.json')))
)

const promises = Promise.all(
  [...data.common, ...data.uncommon]
    .sort((a, b) => a.localeCompare(b))
    .map((d) => item(d))
)

export default function support() {
  return transformer
}

/**
 * @param {Root} tree
 */
async function transformer(tree) {
  const items = await promises

  zone(tree, 'support', (start, _, end) => [
    start,
    u('list', {spread: false}, items),
    end
  ])
}

/**
 * @param {string} name
 */
async function item(name) {
  /** @type {LanguageFn} */
  // type-coverage:ignore-next-line
  const fn = (await import('highlight.js/lib/languages/' + name)).default
  const mod = fn(hljs)
  /** @type {Array.<PhrasingContent>} */
  const content = [u('inlineCode', name)]
  let index = -1

  if (mod.aliases) {
    content.push(u('text', ' ('))

    while (++index < mod.aliases.length) {
      if (index) content.push(u('text', ', '))
      content.push(u('inlineCode', mod.aliases[index]))
    }

    content.push(u('text', ')'))
  }

  content.push(u('text', ' — ' + mod.name))

  return u('listItem', {checked: data.common.includes(name)}, [
    u('paragraph', content)
  ])
}
