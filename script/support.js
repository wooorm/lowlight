/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('highlight.js').LanguageFn} LanguageFn
 */

import hljs from 'highlight.js'
import fs from 'fs'
import path from 'path'
// @ts-ignore remove when typed.
import zone from 'mdast-zone'
import {u} from 'unist-builder'

/** @type {{common: string[], uncommon: string[]}} */
var data = JSON.parse(String(fs.readFileSync(path.join('script', 'data.json'))))

var promises = Promise.all(
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
  var items = await promises

  zone(tree, 'support', replace)

  /**
   * @param {Node} start
   * @param {Array.<Node>} _
   * @param {Node} end
   */
  function replace(start, _, end) {
    return [start, u('list', {spread: false}, items), end]
  }
}

/**
 * @param {string} name
 */
async function item(name) {
  /** @type {LanguageFn} */
  // type-coverage:ignore-next-line
  var fn = (await import('highlight.js/lib/languages/' + name + '.js')).default
  var mod = fn(hljs)
  /** @type {Array.<PhrasingContent>} */
  var content = [u('inlineCode', name)]
  var index = -1

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
