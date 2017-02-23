/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module lowlight
 * @fileoverview Test suite for `lowlight`.
 */

'use strict';

/* Dependencies. */
var fs = require('fs');
var path = require('path');
var test = require('tape');
var rehype = require('rehype');
var visit = require('unist-util-visit');
var low = require('..');

var read = fs.readFileSync;
var join = path.join;

var FIXTURES = path.join(__dirname, 'fixture');
var INPUT = 'input.txt';
var OUTPUT = 'output.txt';

/* Tests. */
test('lowlight.highlight(language, value[, options])', function (t) {
  var result = low.highlight('js', '');

  t.throws(
    function () {
      low.highlight(true);
    },
    /Expected `string` for name, got `true`/,
    'should throw when not given `string` for `name`'
  );

  t.throws(
    function () {
      low.highlight('js', true);
    },
    /Expected `string` for value, got `true`/,
    'should throw when not given `string` for `value`'
  );

  t.throws(
    function () {
      low.highlight('fooscript', '');
    },
    /Unknown language: `fooscript` is not registered/,
    'should throw when given an unknown `language`'
  );

  t.equal(
    result.relevance,
    0,
    'should return a `0` for `relevance` when empty'
  );

  t.deepEqual(
    result.value,
    [],
    'should return an empty array for `value` when empty'
  );

  t.deepEqual(
    low.highlight('js', '# foo').value,
    [{type: 'text', value: '# foo'}],
    'should silently ignore illegals'
  );

  t.deepEqual(
    low.highlight('js', '# foo', {ignore: true}).value,
    [{type: 'text', value: '# foo'}],
    'should silently ignore illegals'
  );

  t.test('fixture', function (st) {
    var result = low.highlight('java', [
      'public void moveTo(int x, int y, int z);'
    ].join('\n'));

    st.equal(
      result.relevance,
      6,
      'should return the correct relevance for the fixture'
    );

    st.equal(
      result.language,
      'java',
      'should return the correct language for the fixture'
    );

    st.deepEqual(
      result.value,
      [
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['hljs-function']},
          children: [
            {
              type: 'element',
              tagName: 'span',
              properties: {className: ['hljs-keyword']},
              children: [{type: 'text', value: 'public'}]
            },
            {type: 'text', value: ' '},
            {
              type: 'element',
              tagName: 'span',
              properties: {className: ['hljs-keyword']},
              children: [{type: 'text', value: 'void'}]
            },
            {type: 'text', value: ' '},
            {
              type: 'element',
              tagName: 'span',
              properties: {className: ['hljs-title']},
              children: [{type: 'text', value: 'moveTo'}]
            },
            {
              type: 'element',
              tagName: 'span',
              properties: {className: ['hljs-params']},
              children: [
                {type: 'text', value: '('},
                {
                  type: 'element',
                  tagName: 'span',
                  properties: {className: ['hljs-keyword']},
                  children: [{type: 'text', value: 'int'}]
                },
                {type: 'text', value: ' x, '},
                {
                  type: 'element',
                  tagName: 'span',
                  properties: {className: ['hljs-keyword']},
                  children: [{type: 'text', value: 'int'}]
                },
                {type: 'text', value: ' y, '},
                {
                  type: 'element',
                  tagName: 'span',
                  properties: {className: ['hljs-keyword']},
                  children: [{type: 'text', value: 'int'}]
                },
                {type: 'text', value: ' z)'}
              ]
            }
          ]
        },
        {type: 'text', value: ';'}
      ],
      'should return the correct AST for the fixture'
    );

    st.end();
  });

  t.test('custom `prefix`', function (st) {
    var result = low.highlight('js', '"use strict";', {
      prefix: 'foo-'
    });

    t.deepEqual(
      result.value[0].properties.className,
      ['foo-meta'],
      'should support a given custom `prefix`'
    );

    st.end();
  });

  t.test('empty `prefix`', function (st) {
    var result = low.highlight('js', '"use strict";', {
      prefix: ''
    });

    t.deepEqual(
      result.value[0].properties.className,
      ['meta'],
      'should support an empty `prefix`'
    );

    st.end();
  });

  t.end();
});

test('lowlight(value[, options])', function (t) {
  var result = low.highlightAuto('');

  t.throws(
    function () {
      low.highlightAuto(true);
    },
    /Expected `string` for value, got `true`/,
    'should throw when not given a string'
  );

  t.equal(
    result.relevance,
    0,
    'should return a `0` for `relevance` when empty'
  );

  t.equal(
    result.language,
    null,
    'should return `null` for `language` when empty'
  );

  t.deepEqual(
    result.value,
    [],
    'should return an empty array for `value` when empty'
  );

  t.test('fixture', function (st) {
    var result = low.highlightAuto([
      '"use strict";'
    ].join('\n'));

    st.equal(
      result.relevance,
      10,
      'should return the correct relevance for the fixture'
    );

    st.equal(
      result.language,
      'javascript',
      'should return the correct language for the fixture'
    );

    st.equal(
      typeof result.secondBest,
      'object',
      'should return a `secondBest` result'
    );

    st.equal(
      result.secondBest.language,
      'abnf',
      'should return a `secondBest` `language`'
    );

    st.equal(
      result.secondBest.relevance,
      2,
      'should return a `secondBest` `relevance`'
    );

    st.deepEqual(
      result.value,
      [
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['hljs-meta']},
          children: [{type: 'text', value: '"use strict"'}]
        },
        {type: 'text', value: ';'}
      ],
      'should return the correct AST for the fixture'
    );

    st.end();
  });

  t.test('custom `prefix`', function (st) {
    var result = low.highlightAuto('"use strict";', {prefix: 'foo-'});

    t.deepEqual(
      result.value[0].properties.className,
      ['foo-meta'],
      'should support a given custom `prefix`'
    );

    st.end();
  });

  t.test('empty `prefix`', function (st) {
    var result = low.highlightAuto('"use strict";', {prefix: ''});

    t.deepEqual(
      result.value[0].properties.className,
      ['meta'],
      'should support an empty `prefix`'
    );

    st.end();
  });

  t.test('custom `subset`', function (st) {
    var result = low.highlightAuto('"use strict";', {subset: ['java']});

    t.equal(
      result.language,
      'java',
      'should support a given custom `subset`'
    );

    t.doesNotThrow(function () {
      result = low.highlightAuto('"use strict";', {
        subset: ['fooscript', 'javascript']
      });
    }, 'should ignore unregistered subset languages (#1)');

    t.equal(
      result.language,
      'javascript',
      'should ignore unregistered subset languages (#2)'
    );

    st.end();
  });

  t.test('harder example (coverage)', function (st) {
    var input = read(join(FIXTURES, 'xml-large', 'input.txt'), 'utf8');
    var output = read(join(FIXTURES, 'xml-large', 'output.txt'), 'utf8');

    input = low.highlightAuto(input);
    output = rehype().data('settings', {fragment: true}).parse(output);

    visit(output, function (node) {
      delete node.position;
    });

    t.deepEqual(
      input.value,
      output.children,
      'should correctly detect xml'
    );

    st.end();
  });

  t.end();
});

test('fixtures', function (t) {
  fs.readdirSync(FIXTURES)
    .forEach(function (filePath) {
      var parts = filePath.split('-');
      if (filePath.charAt(0) !== '.') {
        subtest(parts[0], parts.slice(1).join('-'), filePath);
      }
    });

  /* Test a fixture. */
  function subtest(language, name, directory) {
    var input = read(join(FIXTURES, directory, INPUT), 'utf8').trim();
    var output = read(join(FIXTURES, directory, OUTPUT), 'utf8').trim();

    input = low.highlight(language, input);
    output = rehype().data('settings', {fragment: true}).parse(output);

    visit(output, function (node) {
      delete node.position;
    });

    t.deepEqual(
      input.value,
      output.children,
      'should correctly process ' + name + ' in ' + language
    );
  }

  t.end();
});
