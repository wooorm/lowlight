// Dependencies:

var hast = require('hast');
var low = require('./index.js');

// Compile:

var ast = low.highlight('js', '"use strict";').value;
var html = hast.stringify({'type': 'root', 'children': ast});

// Yields:

console.log('json', JSON.stringify(ast, 0, 2));

// Or, stringified with [hast][]:

console.log('html', html);
