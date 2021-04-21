import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import {name as isIdentifier} from 'estree-util-is-identifier-name'

var doc = String(
  fs.readFileSync(path.join('node_modules', 'highlight.js', 'lib', 'index.js'))
)

var languages = []

doc.replace(/hljs\.registerLanguage\('(.+?)'/g, (_, $1) => {
  languages.push($1)
})

doc = [
  "import {lowlight} from './lib/core.js'",
  languages.map((d, i) => load(d, i)).join('\n'),
  'export {lowlight}',
  languages.map((d, i) => register(d, i)).join('\n'),
  ''
].join('\n')

fs.writeFileSync('index.js', doc)

console.log(
  [
    chalk.green('✓'),
    'wrote `index.js`,',
    'supporting',
    languages.length,
    'languages'
  ].join(' ')
)

function load(lang, index) {
  var id = name(lang, index)
  return 'import ' + id + " from 'highlight.js/lib/languages/" + lang + ".js'"
}

function register(lang, index) {
  var id = name(lang, index)
  return "lowlight.registerLanguage('" + lang + "', " + id + ')'
}

function name(name, index) {
  var cleaned = name.replace(/_[a-z]/, (d) => d.charAt(1).toUpperCase())
  var capped = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  return isIdentifier(cleaned)
    ? cleaned
    : isIdentifier('l' + capped)
    ? 'l' + capped
    : 'l' + index
}
