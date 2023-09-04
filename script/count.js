/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').List} List
 */

import fs from 'node:fs/promises'
import {zone} from 'mdast-zone'

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
      const list = {
        type: 'list',
        spread: false,
        children: [
          {
            type: 'listItem',
            children: [
              {
                type: 'paragraph',
                children: [
                  {type: 'inlineCode', value: 'lib/core.js'},
                  {type: 'text', value: ' — 0 languages'}
                ]
              }
            ]
          },
          {
            type: 'listItem',
            children: [
              {
                type: 'paragraph',
                children: [
                  {type: 'inlineCode', value: 'lib/common.js'},
                  {
                    type: 'text',
                    value: ' (default) — ' + common.length + ' languages'
                  }
                ]
              }
            ]
          },
          {
            type: 'listItem',
            children: [
              {
                type: 'paragraph',
                children: [
                  {type: 'inlineCode', value: 'lib/all.js'},
                  {
                    type: 'text',
                    value:
                      ' — ' + (common.length + uncommon.length) + ' languages'
                  }
                ]
              }
            ]
          }
        ]
      }

      return [start, list, end]
    })
  }
}
