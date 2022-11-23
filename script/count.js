/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').List} List
 */

import fs from 'node:fs/promises'
import {zone} from 'mdast-zone'
import {u} from 'unist-builder'

/** @type {{common: Array<string>, uncommon: Array<string>}} */
const data = JSON.parse(
  String(await fs.readFile(new URL('data.json', import.meta.url)))
)

/** @type {import('unified').Plugin<[], Root>} */
export default function count() {
  return function (tree) {
    zone(tree, 'index', (start, _, end) => {
      const {common, uncommon} = data
      /** @type {List} */
      const list = u('list', {spread: false}, [
        u('listItem', [
          u('paragraph', [
            u('inlineCode', 'lib/core.js'),
            u('text', ' — 0 languages')
          ])
        ]),
        u('listItem', [
          u('paragraph', [
            u('inlineCode', 'lib/common.js'),
            u('text', ' (default) — ' + common.length + ' languages')
          ])
        ]),
        u('listItem', [
          u('paragraph', [
            u('inlineCode', 'lib/all.js'),
            u('text', ' — ' + (common.length + uncommon.length) + ' languages')
          ])
        ])
      ])

      return [start, list, end]
    })
  }
}
