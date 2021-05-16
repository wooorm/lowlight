/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('mdast').Root} Root
 */

import fs from 'fs'
import path from 'path'
import {zone} from 'mdast-zone'
import {u} from 'unist-builder'

/** @type {{common: string[], uncommon: string[]}} */
var data = JSON.parse(String(fs.readFileSync(path.join('script', 'data.json'))))

export default function count() {
  return transformer
}

/**
 * @param {Root} tree
 */
function transformer(tree) {
  zone(tree, 'index', replace)
}

/**
 * @param {Node} start
 * @param {Array.<Node>} _
 * @param {Node} end
 */
function replace(start, _, end) {
  var {common, uncommon} = data

  return [
    start,
    u('list', {spread: false}, [
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
    ]),
    end
  ]
}
