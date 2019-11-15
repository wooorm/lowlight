'use strict'

var high = require('highlight.js/lib/highlight.js')
var fault = require('fault')

// The lowlight interface, which has to be compatible with highlight.js, as
// this object is passed to highlight.js syntaxes.

function High() {}

High.prototype = high

// Expose.
var low = new High() // Ha!

module.exports = low

low.highlight = highlight
low.highlightAuto = autoHighlight
low.registerLanguage = registerLanguage
low.listLanguages = listLanguages
low.registerAlias = registerAlias
low.getLanguage = getLanguage

var inherit = high.inherit
var own = {}.hasOwnProperty

var defaultPrefix = 'hljs-'
var keyInsensitive = 'case_insensitive'
var keyCachedVariants = 'cached_variants'
var keyTerminatorEnd = 'terminator_end'
var space = ' '
var verticalBar = '|'
var parenOpen = '('
var parenClose = ')'
var backslash = '\\'
var commonKeywords = ['of', 'and', 'for', 'in', 'not', 'or', 'if', 'then']

// Maps of syntaxes.
var languageNames = []
var languages = {}
var aliases = {}

// Highlighting with language detection.
// Accepts a string with the code to highlight.
// Returns an object with the following properties:
//
// *   `language` — Detected language
// *   `relevance` — Integer
// *   `value` — HAST tree with highlighting markup
// *   `secondBest` — Object with the same structure for second-best
//     heuristically detected language, may be absent.
function autoHighlight(value, options) {
  var settings = options || {}
  var subset = settings.subset || languageNames
  var prefix = settings.prefix
  var length = subset.length
  var index = -1
  var result
  var secondBest
  var current
  var name

  if (prefix === null || prefix === undefined) {
    prefix = defaultPrefix
  }

  if (typeof value !== 'string') {
    throw fault('Expected `string` for value, got `%s`', value)
  }

  secondBest = normalize({})
  result = normalize({})

  while (++index < length) {
    name = subset[index]

    if (!getLanguage(name)) {
      continue
    }

    current = normalize(coreHighlight(name, value, false, prefix))

    current.language = name

    if (current.relevance > secondBest.relevance) {
      secondBest = current
    }

    if (current.relevance > result.relevance) {
      secondBest = result
      result = current
    }
  }

  if (secondBest.language) {
    result.secondBest = secondBest
  }

  return result
}

// Highlighting `value` in the language `language`.
function highlight(language, value, options) {
  var settings = options || {}
  var prefix = settings.prefix

  if (prefix === null || prefix === undefined) {
    prefix = defaultPrefix
  }

  return normalize(coreHighlight(language, value, true, prefix))
}

// Register a language.
function registerLanguage(name, syntax) {
  var lang = syntax(low)

  lang.rawDefinition = syntax.bind(null, low)

  languages[name] = lang

  languageNames.push(name)

  if (lang.aliases) {
    registerAlias(name, lang.aliases)
  }
}

// Get a list of all registered languages.
function listLanguages() {
  return languageNames.concat()
}

// Register more aliases for an already registered language.
function registerAlias(name, alias) {
  var map = name
  var key
  var list
  var length
  var index

  if (alias) {
    map = {}
    map[name] = alias
  }

  for (key in map) {
    list = map[key]
    list = typeof list === 'string' ? [list] : list
    length = list.length
    index = -1

    while (++index < length) {
      aliases[list[index]] = key
    }
  }
}

// Core highlighting function.
// Accepts a language name, or an alias, and a string with the code to
// highlight.
// eslint-disable-next-line max-params
function coreHighlight(name, value, ignore, prefix, continuation) {
  var lastMatch = {}
  var continuations = {}
  var stack = []
  var modeBuffer = ''
  var relevance = 0
  var language
  var top
  var current
  var currentChildren
  var offset
  var count
  var match
  var children

  if (typeof name !== 'string') {
    throw fault('Expected `string` for name, got `%s`', name)
  }

  if (typeof value !== 'string') {
    throw fault('Expected `string` for value, got `%s`', value)
  }

  language = getLanguage(name)
  top = continuation || language
  children = []

  current = top
  currentChildren = children

  if (!language) {
    throw fault('Unknown language: `%s` is not registered', name)
  }

  compileLanguage(language)

  try {
    top.terminators.lastIndex = 0
    offset = 0
    match = top.terminators.exec(value)

    while (match) {
      count = processLexeme(value.slice(offset, match.index), match)
      offset = match.index + count
      top.terminators.lastIndex = offset
      match = top.terminators.exec(value)
    }

    processLexeme(value.slice(offset))
    current = top

    while (current.parent) {
      if (current.className) {
        pop()
      }

      current = current.parent
    }

    return {
      relevance: relevance,
      value: currentChildren,
      illegal: false,
      language: name,
      top: top
    }
  } catch (error) {
    /* istanbul ignore if - Catch-all  */
    if (error.message.indexOf('Illegal') === -1) {
      throw error
    }

    return {relevance: 0, illegal: true, value: addText(value, [])}
  }

  function escapeRe(value) {
    return new RegExp(value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'm')
  }

  function doBeginMatch(match) {
    var lexeme = match[0]
    var newMode = match.rule

    if (newMode && newMode.endSameAsBegin) {
      newMode.endRe = escapeRe(lexeme)
    }

    if (newMode.skip) {
      modeBuffer += lexeme
    } else {
      if (newMode.excludeBegin) {
        modeBuffer += lexeme
      }

      addSiblings(processBuffer(), currentChildren)

      if (!newMode.returnBegin && !newMode.excludeBegin) {
        modeBuffer = lexeme
      }
    }

    startNewMode(newMode)

    return newMode.returnBegin ? 0 : lexeme.length
  }

  function doEndMatch(match) {
    var lexeme = match[0]
    var matchPlusRemainder = value.slice(match.index)
    var endMode = endOfMode(top, matchPlusRemainder)

    if (!endMode) {
      return
    }

    var origin = top

    if (origin.skip) {
      modeBuffer += lexeme
    } else {
      if (!(origin.returnEnd || origin.excludeEnd)) {
        modeBuffer += lexeme
      }

      addSiblings(processBuffer(), currentChildren)

      if (origin.excludeEnd) {
        modeBuffer = lexeme
      }
    }

    do {
      if (top.className) {
        pop()
      }

      if (!top.skip && !top.subLanguage) {
        relevance += top.relevance
      }

      top = top.parent
    } while (top !== endMode.parent)

    if (endMode.starts) {
      /* istanbul ignore if - hljs 9.16 added support for this but didn’t use it yet. */
      if (endMode.endSameAsBegin) {
        endMode.starts.endRe = endMode.endRe
      }

      startNewMode(endMode.starts)
    }

    return origin.returnEnd ? 0 : lexeme.length
  }

  function processLexeme(textBeforeMatch, match) {
    var lexeme = match && match[0]
    var processed

    // Add non-matched text to the current mode buffer
    modeBuffer += textBeforeMatch

    if (lexeme === undefined) {
      addSiblings(processBuffer(), currentChildren)
      return 0
    }

    // We've found a 0 width match and we're stuck, so we need to advance
    // this happens when we have badly behaved rules that have optional matchers to the degree that
    // sometimes they can end up matching nothing at all
    // Ref: https://github.com/highlightjs/highlight.js/issues/2140
    /* istanbul ignore if - Unknown what this fixes or which case fixes it */
    if (
      lastMatch.type === 'begin' &&
      match.type === 'end' &&
      lastMatch.index === match.index &&
      lexeme === ''
    ) {
      // Spit the “skipped” character that our regex choked on back into the output sequence
      modeBuffer += value.slice(match.index, match.index + 1)
      return 1
    }

    lastMatch = match

    if (match.type === 'begin') {
      return doBeginMatch(match)
    }

    if (match.type === 'end') {
      processed = doEndMatch(match)

      if (processed !== undefined) {
        return processed
      }
    }

    if (match.type === 'illegal' && !ignore) {
      // Illegal match, we do not continue processing
      throw fault(
        'Illegal lexeme "%s" for mode "%s"',
        lexeme,
        top.className || '<unnamed>'
      )
    }

    // Why might be find ourselves here?
    // Only one occasion now.
    // An end match that was triggered but could not be completed.
    // When might this happen?
    // When an `endSameasBegin` rule sets the end rule to a specific match.
    // Since the overall mode termination rule that’s being used to scan the
    // text isn’t recompiled that means that any match that LOOKS like the end
    // (but is not, because it is not an exact match to the beginning) will end
    // up here.
    // A definite end match, but when `doEndMatch` tries to “reapply” the end
    // rule and fails to match, we wind up here, and just silently ignore the
    // end.
    // This causes no real harm other than stopping a few times too many.
    modeBuffer += lexeme

    return lexeme.length
  }

  // Start a new mode with a `lexeme` to process.
  function startNewMode(mode) {
    var node

    if (mode.className) {
      node = build(mode.className, [])
    }

    // Enter a new mode.
    if (node) {
      currentChildren.push(node)
      stack.push(currentChildren)
      currentChildren = node.children
    }

    top = Object.create(mode, {parent: {value: top}})
  }

  // Process the buffer.
  function processBuffer() {
    var result = top.subLanguage ? processSubLanguage() : processKeywords()
    modeBuffer = ''
    return result
  }

  // Process a sublanguage (returns a list of nodes).
  function processSubLanguage() {
    var explicit = typeof top.subLanguage === 'string'
    var subvalue

    /* istanbul ignore if - support non-loaded sublanguages */
    if (explicit && !languages[top.subLanguage]) {
      return addText(modeBuffer, [])
    }

    if (explicit) {
      subvalue = coreHighlight(
        top.subLanguage,
        modeBuffer,
        true,
        prefix,
        continuations[top.subLanguage]
      )
    } else {
      subvalue = autoHighlight(modeBuffer, {
        subset: top.subLanguage.length === 0 ? undefined : top.subLanguage,
        prefix: prefix
      })
    }

    // If we couldn’t highlight, for example because the requests subset isn’t
    // loaded, return a text node.
    if (!subvalue.language) {
      return [buildText(modeBuffer)]
    }

    // Counting embedded language score towards the host language may be
    // disabled with zeroing the containing mode relevance.
    // Usecase in point is Markdown that allows XML everywhere and makes every
    // XML snippet to have a much larger Markdown score.
    if (top.relevance > 0) {
      relevance += subvalue.relevance
    }

    if (explicit) {
      continuations[top.subLanguage] = subvalue.top
    }

    return [build(subvalue.language, subvalue.value, true)]
  }

  // Process keywords. Returns nodes.
  function processKeywords() {
    var nodes = []
    var lastIndex
    var keyword
    var node
    var submatch

    if (!top.keywords) {
      return addText(modeBuffer, nodes)
    }

    lastIndex = 0

    top.lexemesRe.lastIndex = 0

    keyword = top.lexemesRe.exec(modeBuffer)

    while (keyword) {
      addText(modeBuffer.slice(lastIndex, keyword.index), nodes)

      submatch = keywordMatch(top, keyword)

      if (submatch) {
        relevance += submatch[1]

        node = build(submatch[0], [])

        nodes.push(node)

        addText(keyword[0], node.children)
      } else {
        addText(keyword[0], nodes)
      }

      lastIndex = top.lexemesRe.lastIndex
      keyword = top.lexemesRe.exec(modeBuffer)
    }

    addText(modeBuffer.slice(lastIndex), nodes)

    return nodes
  }

  // Add siblings.
  function addSiblings(siblings, nodes) {
    var length = siblings.length
    var index = -1
    var sibling

    while (++index < length) {
      sibling = siblings[index]

      if (sibling.type === 'text') {
        addText(sibling.value, nodes)
      } else {
        nodes.push(sibling)
      }
    }
  }

  // Add a text.
  function addText(value, nodes) {
    var tail

    if (value) {
      tail = nodes[nodes.length - 1]

      if (tail && tail.type === 'text') {
        tail.value += value
      } else {
        nodes.push(buildText(value))
      }
    }

    return nodes
  }

  // Build a text.
  function buildText(value) {
    return {type: 'text', value: value}
  }

  // Build a span.
  function build(name, contents, noPrefix) {
    return {
      type: 'element',
      tagName: 'span',
      properties: {
        className: [(noPrefix ? '' : prefix) + name]
      },
      children: contents
    }
  }

  // Check if the first word in `keywords` is a keyword.
  function keywordMatch(mode, keywords) {
    var keyword = keywords[0]

    if (language[keyInsensitive]) {
      keyword = keyword.toLowerCase()
    }

    return own.call(mode.keywords, keyword) && mode.keywords[keyword]
  }

  // Check if `lexeme` ends `mode`.
  function endOfMode(mode, lexeme) {
    if (test(mode.endRe, lexeme)) {
      while (mode.endsParent && mode.parent) {
        mode = mode.parent
      }

      return mode
    }

    if (mode.endsWithParent) {
      return endOfMode(mode.parent, lexeme)
    }
  }

  // Exit the current context.
  function pop() {
    /* istanbul ignore next - removed in hljs 9.3 */
    currentChildren = stack.pop() || children
  }
}

// Compile a language.
function compileLanguage(language) {
  compileMode(language)

  // Compile a language mode, optionally with a parent.
  function compileMode(mode, parent) {
    if (mode.compiled) {
      return
    }

    mode.compiled = true

    mode.keywords = mode.keywords || mode.beginKeywords

    if (mode.keywords) {
      mode.keywords = compileKeywords(mode.keywords, language[keyInsensitive])
    }

    mode.lexemesRe = langRe(mode.lexemes || /\w+/, true)

    if (parent) {
      if (mode.beginKeywords) {
        mode.begin =
          '\\b(' + mode.beginKeywords.split(space).join(verticalBar) + ')\\b'
      }

      if (!mode.begin) {
        mode.begin = /\B|\b/
      }

      mode.beginRe = langRe(mode.begin)

      if (mode.endSameAsBegin) {
        mode.end = mode.begin
      }

      if (!mode.end && !mode.endsWithParent) {
        mode.end = /\B|\b/
      }

      if (mode.end) {
        mode.endRe = langRe(mode.end)
      }

      mode[keyTerminatorEnd] = source(mode.end) || ''

      if (mode.endsWithParent && parent[keyTerminatorEnd]) {
        mode[keyTerminatorEnd] +=
          (mode.end ? verticalBar : '') + parent[keyTerminatorEnd]
      }
    }

    if (mode.illegal) {
      mode.illegalRe = langRe(mode.illegal)
    }

    if (mode.relevance === undefined) {
      mode.relevance = 1
    }

    mode.contains = compileContains(mode.contains || [], mode)

    if (mode.starts) {
      compileMode(mode.starts, parent)
    }

    mode.terminators = buildModeRegex(mode)
  }

  function compileContains(contains, mode) {
    var result = []
    var length = contains.length
    var index = -1
    var contained

    while (++index < length) {
      contained = contains[index]
      result = result.concat(
        expandOrCloneMode(contained === 'self' ? mode : contained)
      )
    }

    length = result.length
    index = -1

    while (++index < length) {
      compileMode(result[index], mode)
    }

    return result
  }

  function buildModeRegex(mode) {
    var indices = {}
    var expression
    var regexes = []
    var matcher = {}
    var matchAt = 1
    var term
    var values = mode.contains
    var length = values.length
    var index = -1
    var terminators = []

    while (++index < length) {
      term = values[index]

      addRule(
        term,
        term.beginKeywords ? '\\.?(?:' + term.begin + ')\\.?' : term.begin
      )
    }

    if (mode[keyTerminatorEnd]) {
      addRule('end', mode[keyTerminatorEnd])
    }

    if (mode.illegal) {
      addRule('illegal', mode.illegal)
    }

    length = regexes.length
    index = -1

    while (++index < length) {
      terminators[index] = regexes[index][1]
    }

    expression = langRe(joinRe(terminators, verticalBar), true)

    matcher = {lastIndex: 0, exec: exec}

    return matcher

    function exec(value) {
      var length
      var index
      var rule
      var match
      var submatch

      if (regexes.length === 0) return null

      expression.lastIndex = matcher.lastIndex
      match = expression.exec(value)

      if (!match) {
        return null
      }

      length = match.length
      index = -1

      while (++index < length) {
        submatch = match[index]

        if (submatch !== undefined && indices[index] !== undefined) {
          rule = indices[index]
          break
        }
      }

      // Illegal or end match
      if (typeof rule === 'string') {
        match.type = rule
        match.extra = [mode.illegal, mode.terminator_end]
      } else {
        match.type = 'begin'
        match.rule = rule
      }

      return match
    }

    function addRule(rule, regex) {
      indices[matchAt] = rule
      regexes.push([rule, regex])
      matchAt += new RegExp(regex.toString() + verticalBar).exec('').length
    }
  }

  function joinRe(regexes, separator) {
    var backreferenceRe = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9]\d*)|\\./
    var captures = 0
    var result = ''
    var length = regexes.length
    var index = -1
    var regex
    var offset
    var expression
    var match

    while (++index < length) {
      regex = regexes[index]
      expression = source(regex)
      captures += 1
      offset = captures

      if (index !== 0) {
        result += separator
      }

      result += parenOpen

      while (expression.length > 0) {
        match = backreferenceRe.exec(expression)

        if (match === null) {
          result += expression
          break
        }

        result += expression.slice(0, match.index)
        expression = expression.slice(match.index + match[0].length)

        if (match[0][0] === backslash && match[1]) {
          // Adjust the backreference.
          result += backslash + String(Number(match[1]) + offset)
        } else {
          result += match[0]

          if (match[0] === parenOpen) {
            captures++
          }
        }
      }

      result += parenClose
    }

    return result
  }

  // Create a regex for `value`.
  function langRe(value, global) {
    return new RegExp(
      source(value),
      'm' + (language[keyInsensitive] ? 'i' : '') + (global ? 'g' : '')
    )
  }

  // Get the source of an expression or string.
  function source(re) {
    return (re && re.source) || re
  }
}

function compileKeywords(values, caseInsensitive) {
  var compiled = {}
  var key

  if (typeof values === 'string') {
    flatten('keyword', values)
  } else {
    for (key in values) {
      flatten(key, values[key])
    }
  }

  return compiled

  function flatten(key, value) {
    var val = caseInsensitive ? value.toLowerCase() : value
    all(key, val.split(space))
  }

  function all(key, values) {
    var length = values.length
    var index = -1
    var pair

    while (++index < length) {
      pair = values[index].split(verticalBar)
      compiled[pair[0]] = [key, Number(pair[1]) || common(pair[0]) ? 0 : 1]
    }
  }
}

function common(value) {
  return commonKeywords.indexOf(value.toLowerCase()) !== -1
}

function expandOrCloneMode(mode) {
  var length
  var index
  var variants
  var result

  if (mode.variants && !mode[keyCachedVariants]) {
    variants = mode.variants
    length = variants.length
    index = -1
    result = []

    while (++index < length) {
      result[index] = inherit(mode, {variants: null}, variants[index])
    }

    mode[keyCachedVariants] = result
  }

  // Expand.
  if (mode.cached_variants) return mode.cached_variants

  // Clone.
  if (dependencyOnParent(mode))
    return [inherit(mode, {starts: mode.starts ? inherit(mode.starts) : null})]

  return [mode]
}

function dependencyOnParent(mode) {
  return mode ? mode.endsWithParent || dependencyOnParent(mode.starts) : false
}

// Normalize a syntax result.
function normalize(result) {
  return {
    relevance: result.relevance || 0,
    language: result.language || null,
    value: result.value || []
  }
}

// Check if `expression` matches `lexeme`.
function test(expression, lexeme) {
  var match = expression && expression.exec(lexeme)
  return match && match.index === 0
}

// Get a language by `name`.
function getLanguage(name) {
  name = name.toLowerCase()

  return languages[name] || languages[aliases[name]]
}
