/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module lowlight
 * @fileoverview Create the language registry.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

/*
 * Constants.
 */

var OUTPUT = path.join(__dirname, '..', 'index.js');
var INPUT = path.join(
    __dirname,
    '..',
    'node_modules',
    'highlight.js',
    'lib',
    'index.js'
);

/*
 * Read.
 */

var doc = fs.readFileSync(INPUT, 'utf8');

/*
 * Gather.
 */

var languages = [];

doc.replace(/hljs\.registerLanguage\('(.+?)'/g, function ($0, $1) {
    languages.push($1);
});

/*
 * Write.
 */

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
    '/* eslint-env commonjs */',
    '',
    'var low = require(\'./lib/core.js\');',
    '',
    '/* jscs:disable maximumLineLength */',
    '',
    languages.map(function (lang) {
        return 'low.registerLanguage(\'' + lang + '\', ' +
            'require(\'highlight.js/lib/languages/' + lang + '\'));';
    }).join('\n'),
    '',
    '/*',
    ' * Expose.',
    ' */',
    '',
    'module.exports = low;',
    ''
].join('\n'));

/*
 * Report.
 */

/* eslint-disable no-console */

console.log(
    chalk.green('✓') + ' wrote `index.js`, ' +
    'supporting ' + languages.length + ' languages'
);
