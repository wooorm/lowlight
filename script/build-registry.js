import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import {name as isIdentifier} from 'estree-util-is-identifier-name'

var doc = String(
  fs.readFileSync(path.join('node_modules', 'highlight.js', 'lib', 'index.js'))
)

/** @type {Array.<string>} */
var languages = []

doc.replace(/hljs\.registerLanguage\('(.+?)'/g, (
  /** @type {string} */ _,
  /** @type {string} */ $1
) => {
  languages.push($1)
  return ''
})

fs.writeFileSync(
  'index.js',
  [
    "import {lowlight} from './lib/core.js'",
    ...languages.map((lang, index) => {
      var id = name(lang, index)
      return (
        'import ' + id + " from 'highlight.js/lib/languages/" + lang + ".js'"
      )
    }),
    'export {lowlight}',
    ...languages.map((lang, index) => {
      var id = name(lang, index)
      return "lowlight.registerLanguage('" + lang + "', " + id + ')'
    }),
    ''
  ].join('\n')
)

console.log(
  [
    chalk.green('✓'),
    'wrote `index.js`,',
    'supporting',
    languages.length,
    'languages'
  ].join(' ')
)

/**
 * @param {string} name
 * @param {number} index
 * @returns {string}
 */
function name(name, index) {
  var cleaned = name.replace(/[_-][a-z]/, (d) => d.charAt(1).toUpperCase())
  return isIdentifier(cleaned)
    ? cleaned
    : isIdentifier('$' + cleaned)
    ? '$' + cleaned
    : '$' + index
}
