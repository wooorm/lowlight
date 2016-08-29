/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module lowlight
 * @fileoverview Create the language registry.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

/* Constants. */
var OUTPUT = path.join(__dirname, '..', 'index.js');
var INPUT = path.join(__dirname, '..', 'node_modules', 'highlight.js', 'lib', 'index.js');

var doc = fs.readFileSync(INPUT, 'utf8');

var languages = [];

doc.replace(/hljs\.registerLanguage\('(.+?)'/g, function ($0, $1) {
  languages.push($1);
});

fs.writeFileSync(OUTPUT, [
  '/**',
  ' * @author Titus Wormer',
  ' * @copyright 2016 Titus Wormer',
  ' * @license MIT',
  ' * @module lowlight',
  ' * @fileoverview Virtual syntax highlighting for virtual',
  ' *   DOMs and non-HTML things.',
  ' */',
  '',
  '\'use strict\';',
  '',
  '/* Expose. */',
  'var low = module.exports = require(\'./lib/core.js\');',
  '',
  languages.map(function (lang) {
    return 'low.registerLanguage(\'' + lang + '\', ' +
      'require(\'highlight.js/lib/languages/' + lang + '\'));';
  }).join('\n'),
  ''
].join('\n'));

console.log(
  chalk.green('✓') + ' wrote `index.js`, ' +
  'supporting ' + languages.length + ' languages'
);
