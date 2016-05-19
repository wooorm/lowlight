/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module lowlight:lowlight
 * @fileoverview Virtual syntax highlighting for virtual
 *   DOMs and non-HTML things.
 */

'use strict';

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var high = require('highlight.js/lib/highlight.js');

/*
 * Methods.
 */

var inherit = high.inherit;

/*
 * Low - Populated later.
 */

var low;

/*
 * Constants.
 */

var DEFAULT_PREFIX = 'hljs-';
var KEY_INSENSITIVE = 'case_insensitive';
var EMPTY = '';

/*
 * Constant characters.
 */

var C_SPACE = ' ';
var C_PIPE = '|';

/*
 * Constant types.
 */

var T_ELEMENT = 'element';
var T_TEXT = 'text';
var T_SPAN = 'span';

/*
 * Maps of syntaxes.
 */

var languageNames = [];
var languages = {};
var aliases = {};

/**
 * Get a language by `name`.
 *
 * @private
 * @param {string} name - Name or alias of language.
 * @return {Object?} - Syntax.
 */
function getLanguage(name) {
    name = name.toLowerCase();

    return languages[name] || languages[aliases[name]];
}

/**
 * No-op exec.
 *
 * @private
 * @return {null} - Void result.
 */
function execNoop() {
    return null;
}

/**
 * Check.
 *
 * @private
 * @param {RegExp} expression - Expression.
 * @param {string} lexeme - Value.
 * @return {boolean} - whether `lexeme` matches `re`.
 */
function test(expression, lexeme) {
    var match = expression && expression.exec(lexeme);

    return match && match.index == 0;
}

/**
 * Normalize a syntax result.
 *
 * @param {Object} result - Syntax result.
 * @return {Object} - Normalized syntax result.
 */
function normalize(result) {
    return {
        'relevance': result.relevance || 0,
        'language': result.language || null,
        'value': result.value || []
    };
}

/**
 * Compile a language.
 *
 * @private
 * @param {Object} language - Language to compile.
 */
function compileLanguage(language) {
    /**
     * Get the source of an expression or string.
     *
     * @private
     * @param {RegExp|string} re - Value.
     * @return {string} - Source.
     */
    function source(re) {
        return (re && re.source) || re;
    }

    /**
     * Get the source of an expression or string.
     *
     * @private
     * @param {RegExp|string} value - Expression.
     * @param {boolean?} [global] - Whether to execute
     *   globally.
     * @return {RegExp} - Compiled expression.
     */
    function langRe(value, global) {
        return new RegExp(
            source(value),
            'm' + (language[KEY_INSENSITIVE] ? 'i' : '') +
            (global ? 'g' : '')
        );
    }

    /**
     * Compile a mode.
     *
     * @private
     * @param {Object} mode - Language mode to compile.
     * @param {Object} [parent] - Parent mode.
     */
    function compileMode(mode, parent) {
        var compiledKeywords = {};
        var expandedContains = [];
        var terminators;

        /**
         * Flatten a class-name.
         *
         * @private
         * @param {string} className - Classname to flatten.
         * @param {string} value - Value.
         */
        function flatten(className, value) {
            var pairs;
            var pair;
            var index;
            var length;

            if (language[KEY_INSENSITIVE]) {
                value = value.toLowerCase();
            }

            pairs = value.split(C_SPACE);
            length = pairs.length;
            index = -1;

            while (++index < length) {
                pair = pairs[index].split(C_PIPE);

                compiledKeywords[pair[0]] = [
                    className,
                    pair[1] ? Number(pair[1]) : 1
                ];
            }
        }

        if (mode.compiled) {
            return;
        }

        mode.compiled = true;

        mode.keywords = mode.keywords || mode.beginKeywords;

        if (mode.keywords) {
            if (typeof mode.keywords == 'string') {
                flatten('keyword', mode.keywords);
            } else {
                Object.keys(mode.keywords).forEach(function (className) {
                    flatten(className, mode.keywords[className]);
                });
            }

            mode.keywords = compiledKeywords;
        }

        mode.lexemesRe = langRe(mode.lexemes || /\w+/, true);

        if (parent) {
            if (mode.beginKeywords) {
                mode.begin = '\\b(' +
                    mode.beginKeywords.split(C_SPACE).join(C_PIPE) +
                ')\\b';
            }
            if (!mode.begin) {
                mode.begin = /\B|\b/;
            }

            mode.beginRe = langRe(mode.begin);

            if (!mode.end && !mode.endsWithParent) {
                mode.end = /\B|\b/;
            }

            if (mode.end) {
                mode.endRe = langRe(mode.end);
            }

            mode.terminatorEnd = source(mode.end) || EMPTY;

            if (mode.endsWithParent && parent.terminatorEnd) {
                mode.terminatorEnd += (mode.end ? C_PIPE : EMPTY) +
                    parent.terminatorEnd;
            }
        }

        if (mode.illegal) {
            mode.illegalRe = langRe(mode.illegal);
        }

        if (mode.relevance === undefined) {
            mode.relevance = 1;
        }

        if (!mode.contains) {
            mode.contains = [];
        }

        mode.contains.forEach(function (c) {
            if (c.variants) {
                c.variants.forEach(function (v) {
                    expandedContains.push(inherit(c, v));
                });
            } else {
                expandedContains.push(c == 'self' ? mode : c);
            }
        });

        mode.contains = expandedContains;

        mode.contains.forEach(function (c) {
            compileMode(c, mode);
        });

        if (mode.starts) {
            compileMode(mode.starts, parent);
        }

        terminators =
            mode.contains.map(function (c) {
                return c.beginKeywords ?
                    '\\.?(' + c.begin + ')\\.?' :
                    c.begin;
            })
            .concat([mode.terminatorEnd, mode.illegal])
            .map(source)
            .filter(Boolean);

        mode.terminators = terminators.length ?
            langRe(terminators.join(C_PIPE), true) :
            {'exec': execNoop};
    }

    compileMode(language);
}

/**
 * Register a language.
 *
 * @param {string} name - Name of language.
 * @param {Function} syntax - Syntax constructor.
 */
function registerLanguage(name, syntax) {
    var lang = languages[name] = syntax(low);
    var values = lang.aliases;
    var length = values && values.length;
    var index = -1;

    languageNames.push(name);

    while (++index < length) {
        aliases[values[index]] = name;
    }
}

/**
 * Core highlighting function.  Accepts a language name, or
 * an alias, and a string with the code to highlight.
 * Returns an object with the following properties:
 *
 * @private
 * @param {string} name - Language name.
 * @param {string} value - Source to highlight.
 * @param {boolean} [ignore=false] - Whether to ignore
 *   illegals.
 * @param {string?} [prefix] - Whether to continue
 *   processing with `continuation`.
 * @param {boolean} [continuation] - Whether to continue
 *   processing with `continuation`.
 * @return {Object} - Highlighted `value`.
*/
function coreHighlight(name, value, ignore, prefix, continuation) {
    var continuations = {};
    var stack = [];
    var modeBuffer = EMPTY;
    var relevance = 0;
    var language;
    var top;
    var current;
    var currentChildren;
    var offset;
    var count;
    var match;
    var children;

    if (typeof name !== 'string') {
        throw new Error('Expected `string` for name, got `' + name + '`');
    }

    if (typeof value !== 'string') {
        throw new Error('Expected `string` for value, got `' + value + '`');
    }

    language = getLanguage(name);
    current = top = continuation || language;
    currentChildren = children = [];

    if (!language) {
        throw new Error('Expected `' + name + '` to be registered');
    }

    compileLanguage(language);

    /**
     * Exit the current context.
     *
     * @private
     */
    function pop() {
        /* istanbul ignore next - removed in hljs 9.3 */
        currentChildren = stack.pop() || children;
    }

    /**
     * Check a sub-mode.
     *
     * @private
     * @param {string} lexeme - Value.
     * @param {Object} mode - Sub-mode.
     * @return {boolean} - Whether the lexeme matches.
     */
    function subMode(lexeme, mode) {
        var values = mode.contains;
        var length = values.length;
        var index = -1;

        while (++index < length) {
            if (test(values[index].beginRe, lexeme)) {
                return values[index];
            }
        }
    }

    /**
     * Check if `lexeme` ends `mode`.
     *
     * @private
     * @param {Object} mode - Sub-mode.
     * @param {string} lexeme - Value.
     * @return {boolean} - Whether `lexeme` ends `mode`.
     */
    function endOfMode(mode, lexeme) {
        if (test(mode.endRe, lexeme)) {
            while (mode.endsParent && mode.parent) {
                mode = mode.parent;
            }
            return mode;
        }
        if (mode.endsWithParent) {
            return endOfMode(mode.parent, lexeme);
        }
    }

    /**
     * Check if `lexeme` is illegal according to `mode`.
     *
     * @private
     * @param {string} lexeme - Value.
     * @param {Object} mode - Sub-mode.
     * @return {boolean} - Whether `lexeme` is illegal
     *   according to `mode`.
     */
    function isIllegal(lexeme, mode) {
        return !ignore && test(mode.illegalRe, lexeme);
    }

    /**
     * Check if the first word in `keywords` is a keyword.
     *
     * @private
     * @param {Object} mode - Sub-mode.
     * @param {Array.<string>} keywords - Words.
     * @return {boolean} - Whether the first word in
     *   `keywords` is a keyword.
     */
    function keywordMatch(mode, keywords) {
        var keyword = keywords[0];

        if (language[KEY_INSENSITIVE]) {
            keyword = keyword.toLowerCase();
        }

        return mode.keywords.hasOwnProperty(keyword) &&
            mode.keywords[keyword];
    }

    /**
     * Build a span.
     *
     * @private
     * @param {string} name - Class-name.
     * @param {string} contents - Value inside the span.
     * @param {boolean?} [noPrefix] - Don’t prefix class.
     * @return {HASTNode} - HAST Element node.
     */
    function build(name, contents, noPrefix) {
        return {
            'type': T_ELEMENT,
            'tagName': T_SPAN,
            'properties': {
                'className': [(noPrefix ? EMPTY : prefix) + name]
            },
            'children': contents
        };
    }

    /**
     * Build a text.
     *
     * @private
     * @param {string} value - Content.
     * @return {HASTNode} - HAST Text node.
     */
    function buildText(value) {
        return {
            'type': T_TEXT,
            'value': value
        };
    }

    /**
     * Add a text.
     *
     * @private
     * @param {string} value - Content.
     * @param {Array.<Node>} [nodes] - Nodes to add to,
     *   defaults to `currentChildren`.
     */
    function addText(value, nodes) {
        var tail;

        if (value) {
            tail = nodes[nodes.length - 1];

            if (tail && tail.type === T_TEXT) {
                tail.value += value;
            } else {
                nodes.push(buildText(value));
            }
        }

        return nodes;
    }

    /**
     * Add a text.
     *
     * @private
     * @param {Array.<Node>} siblings - Nodes to add.
     * @param {Array.<Node>} [nodes] - Nodes to add to.
     */
    function addSiblings(siblings, nodes) {
        var length = siblings.length;
        var index = -1;
        var sibling;

        while (++index < length) {
            sibling = siblings[index];

            if (sibling.type === T_TEXT) {
                addText(sibling.value, nodes);
            } else {
                nodes.push(sibling);
            }
        }
    }

    /**
     * Process keywords.
     *
     * @private
     * @return {Array.<Node>} - Nodes.
     */
    function processKeywords() {
        var nodes = [];
        var lastIndex;
        var keyword;
        var node;
        var submatch;

        if (!top.keywords) {
            return addText(modeBuffer, nodes);
        }

        lastIndex = 0;

        top.lexemesRe.lastIndex = 0;

        keyword = top.lexemesRe.exec(modeBuffer);

        while (keyword) {
            addText(modeBuffer.substr(
                lastIndex, keyword.index - lastIndex
            ), nodes);

            submatch = keywordMatch(top, keyword);

            if (submatch) {
                relevance += submatch[1];

                node = build(submatch[0], []);

                nodes.push(node);

                addText(keyword[0], node.children);
            } else {
                addText(keyword[0], nodes);
            }

            lastIndex = top.lexemesRe.lastIndex;
            keyword = top.lexemesRe.exec(modeBuffer);
        }

        addText(modeBuffer.substr(lastIndex), nodes);

        return nodes;
    }

    /**
     * Process a sublanguage.
     *
     * @private
     * @return {Array.<Node>} - Nodes.
     */
    function processSubLanguage() {
        var explicit = typeof top.subLanguage == 'string';
        var subvalue;

        /* istanbul ignore if - support non-loaded sublanguages */
        if (explicit && !languages[top.subLanguage]) {
            return addText(modeBuffer, []);
        }

        if (explicit) {
            subvalue = coreHighlight(
                top.subLanguage,
                modeBuffer,
                true,
                prefix,
                continuations[top.subLanguage]
            );
        } else {
            subvalue = autoHighlight(modeBuffer, {
                'subset': top.subLanguage.length ?
                    top.subLanguage : undefined,
                'prefix': prefix
            });
        }

        /*
         * Counting embedded language score towards the
         * host language may be disabled with zeroing the
         * containing mode relevance.  Usecase in point is
         * Markdown that allows XML everywhere and makes
         * every XML snippet to have a much larger Markdown
         * score.
         */

        if (top.relevance > 0) {
            relevance += subvalue.relevance;
        }

        if (explicit) {
            continuations[top.subLanguage] = subvalue.top;
        }

        return [build(subvalue.language, subvalue.value, true)];
    }

    /**
     * Process the buffer.
     *
     * @private
     * @return {string} - The processed buffer.
     */
    function processBuffer() {
        var result = top.subLanguage !== undefined ?
            processSubLanguage() :
            processKeywords();

        modeBuffer = EMPTY;

        return result;
    }

    /**
     * Start a new mode.
     *
     * @private
     * @param {Object} mode - Mode to use.
     * @param {string} lexeme - Lexeme to process..
     */
    function startNewMode(mode, lexeme) {
        var node;

        if (mode.className) {
            node = build(mode.className, []);
        }

        if (mode.returnBegin) {
            modeBuffer = EMPTY;
        } else if (mode.excludeBegin) {
            addText(lexeme, currentChildren);

            modeBuffer = EMPTY;
        } else {
            modeBuffer = lexeme;
        }

        /*
         * Enter a new mode.
         */

        if (node) {
            currentChildren.push(node);
            stack.push(currentChildren);
            currentChildren = node.children;
        }

        top = Object.create(mode, {
            'parent': {
                'value': top
            }
        });
    }

    /**
     * Process a lexeme.
     *
     * @private
     * @param {string} buffer - Current buffer.
     * @param {string} lexeme - Current lexeme.
     * @return {number} - Next position.
     */
    function processLexeme(buffer, lexeme) {
        var newMode;
        var endMode;
        var origin;

        modeBuffer += buffer;

        if (lexeme === undefined) {
            addSiblings(processBuffer(), currentChildren);

            return 0;
        }

        newMode = subMode(lexeme, top);

        if (newMode) {
            addSiblings(processBuffer(), currentChildren);

            startNewMode(newMode, lexeme);

            return newMode.returnBegin ? 0 : lexeme.length;
        }

        endMode = endOfMode(top, lexeme);

        if (endMode) {
            origin = top;

            if (!(origin.returnEnd || origin.excludeEnd)) {
                modeBuffer += lexeme;
            }

            addSiblings(processBuffer(), currentChildren);

            /*
             * Close open modes.
             */

            do {
                if (top.className) {
                    pop();
                }

                relevance += top.relevance;
                top = top.parent;
            } while (top !== endMode.parent);

            if (origin.excludeEnd) {
                addText(lexeme, currentChildren);
            }

            modeBuffer = EMPTY;

            if (endMode.starts) {
                startNewMode(endMode.starts, EMPTY);
            }

            return origin.returnEnd ? 0 : lexeme.length;
        }

        if (isIllegal(lexeme, top)) {
            throw new Error(
                'Illegal lexeme "' + lexeme + '" for mode "' +
                (top.className || '<unnamed>') + '"'
            );
        }

        /*
         * Parser should not reach this point as all
         * types of lexemes should be caught earlier,
         * but if it does due to some bug make sure it
         * advances at least one character forward to
         * prevent infinite looping.
         */

        modeBuffer += lexeme;

        return lexeme.length || /* istanbul ignore next */ 1;
    }

    try {
        offset = top.terminators.lastIndex = 0;
        match = top.terminators.exec(value);

        while (match) {
            count = processLexeme(
                value.substr(offset, match.index - offset),
                match[0]
            );

            offset = top.terminators.lastIndex = match.index + count;
            match = top.terminators.exec(value);
        }

        processLexeme(value.substr(offset));
        current = top;

        while (current.parent) {
            if (current.className) {
                pop();
            }

            current = current.parent;
        }

        return {
            'relevance': relevance,
            'value': currentChildren,
            'language': name,
            'top': top
        };
    } catch (e) {
        /* istanbul ignore else - Catch-all  */
        if (e.message.indexOf('Illegal') !== -1) {
            return {
                'relevance': 0,
                'value': addText(value, [])
            };
        } else {
            throw e;
        }
    }
}

/**
 * Highlighting with language detection.  Accepts a string
 * with the code to highlight.  Returns an object with the
 * following properties:
 *
 * - language (detected language)
 * - relevance (int)
 * - value (an HTML string with highlighting markup)
 * - secondBest (object with the same structure for
 *   second-best heuristically detected language, may
 *   be absent).
 *
 * @param {string} value - Source to highlight.
 * @param {Object?} [options={}] - Configuration.
 * @param {string} [options.prefix='hljs-'] - Highlight
 *   prefix.
 * @param {Array.<string>} [options.subset] - List of
 *   allowed languages.
 * @return {Object} - Highlighted `value`.
 */
function autoHighlight(value, options) {
    var settings = options || {};
    var prefix = settings.prefix || DEFAULT_PREFIX;
    var subset = settings.subset || languageNames;
    var result;
    var secondBest;
    var index;
    var length;
    var current;
    var name;

    length = subset.length;
    index = -1;

    if (typeof value !== 'string') {
        throw new Error('Expected `string` for value, got `' + value + '`');
    }

    secondBest = normalize({});
    result = normalize({});

    while (++index < length) {
        name = subset[index];

        if (!getLanguage(name)) {
            continue;
        }

        current = normalize(coreHighlight(name, value, false, prefix));

        current.language = name;

        if (current.relevance > secondBest.relevance) {
            secondBest = current;
        }

        if (current.relevance > result.relevance) {
            secondBest = result;
            result = current;
        }
    }

    if (secondBest.language) {
        result.secondBest = secondBest;
    }

    return result;
}

/**
 * Highlighting `value` in the language `language`.
 *
 * @private
 * @param {string} language - Language name.
 * @param {string} value - Source to highlight.
 * @param {Object?} [options={}] - Configuration.
 * @param {string} [options.prefix='hljs-'] - Highlight
 *   prefix.
 * @return {Object} - Highlighted `value`.
*/
function highlight(language, value, options) {
    var settings = options || {};
    var prefix = settings.prefix || DEFAULT_PREFIX;

    return normalize(coreHighlight(language, value, true, prefix));
}

/*
 * The lowlight interface, which has to be compatible
 * with highlight.js, as this object is passed to
 * highlight.js syntaxes.
 */

/** High constructor. */
function High() {}

High.prototype = high;

low = new High(); // Ha!

low.highlight = highlight;
low.highlightAuto = autoHighlight;
low.registerLanguage = registerLanguage;
low.getLanguage = getLanguage;

/*
 * Expose.
 */

module.exports = low;
