import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import {name as isIdentifier} from 'estree-util-is-identifier-name'

var doc = String(
  fs.readFileSync(path.join('node_modules', 'highlight.js', 'lib', 'index.js'))
)

var category = /\/\*.*?Category: (.*?)\r?\n/s
var register = /hljs\.registerLanguage\('(.+?)'/g
var index = -1
/** @type {Array.<string>} */
var all = []
/** @type {Array.<string>} */
var common = []
/** @type {Array.<string>} */
var uncommon = []
/** @type {RegExpMatchArray} */
var match

while ((match = register.exec(doc))) all.push(match[1])

while (++index < all.length) {
  doc = String(
    fs.readFileSync(
      path.join(
        'node_modules',
        'highlight.js',
        'lib',
        'languages',
        all[index] + '.js'
      )
    )
  )

  match = category.exec(doc)

  if (match && match[1].split(/,\s?/).includes('common')) {
    common.push(all[index])
  }
}

common.sort((a, b) => a.localeCompare(b))

uncommon = all
  .filter((d) => !common.includes(d))
  .sort((a, b) => a.localeCompare(b))

fs.writeFileSync(path.join('lib', 'common.js'), generate(common, 'core'))
fs.writeFileSync(path.join('lib', 'all.js'), generate(uncommon, 'common'))

fs.writeFileSync(
  path.join('script', 'data.json'),
  JSON.stringify({common, uncommon}, null, 2) + '\n'
)

console.log(
  '%s wrote `lib/common.js` (%d languages)',
  chalk.green('✓'),
  common.length
)

console.log(
  '%s wrote `lib/all.js` (%d more languages; %d total)',
  chalk.green('✓'),
  uncommon.length,
  all.length
)

/**
 * @param {Array.<string>} list
 * @param {string} base
 * @returns {string}
 */
function generate(list, base) {
  return [
    ...list.map(
      (d) => 'import ' + id(d) + " from 'highlight.js/lib/languages/" + d + "'"
    ),
    "import {lowlight} from './" + base + ".js'",
    'export {lowlight}',
    ...list.map((d) => "lowlight.registerLanguage('" + d + "', " + id(d) + ')'),
    ''
  ].join('\n')
}

/**
 * @param {string} name
 * @returns {string}
 */
function id(name) {
  var cleaned = name.replace(/[_-][a-z]/, (d) => d.charAt(1).toUpperCase())
  if (isIdentifier(cleaned)) return cleaned
  if (isIdentifier('$' + cleaned)) return '$' + cleaned
  throw new Error('Could not generate id for `' + name + '`')
}
