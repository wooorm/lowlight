'use strict'

var fs = require('fs')
var chalk = require('chalk')

var doc = fs.readFileSync(require.resolve('highlight.js'), 'utf8')

var languages = []

doc.replace(/hljs\.registerLanguage\('(.+?)'/g, add)

doc = [
  "'use strict'",
  '',
  "var low = require('./lib/core.js')",
  '',
  'module.exports = low',
  '',
  languages.map(register).join('\n'),
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

function add($0, $1) {
  languages.push($1)
}

function register(lang) {
  return (
    "low.registerLanguage('" +
    lang +
    "', " +
    "require('highlight.js/lib/languages/" +
    lang +
    "'))"
  )
}
