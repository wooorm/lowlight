/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Text} Text
 *
 * @typedef {Omit<Element, 'children'> & {children: Array.<LowlightElement|Text>}} LowlightElement
 * @typedef {Omit<Root, 'children'> & {children: Array.<LowlightElement|Text>}} LowlightRoot
 *
 * @typedef {Object} ExtraAutoOptions
 * @property {Array.<string>} [subset] List of allowed languages; defaults to all registered languages
 *
 * @typedef {Object} LowlightOptions
 * @property {string} [prefix='hljs-'] Class prefix
 *
 * @typedef {LowlightOptions & ExtraAutoOptions} LowlightAutoOptions
 *
 * @typedef {Object} LowlightResult
 * @property {number} relevance How sure lowlight is that the given code is in the found language
 * @property {string|null} language The detected `language` name
 * @property {LowlightRoot['children']} value Virtual nodes representing the highlighted given code
 *
 * @typedef {Object} ExtraAutoResult
 * @property {LowlightResult} [secondBest] Result of the second-best (based on `relevance`) match; can still be `undefined`
 *
 * @typedef {LowlightResult & ExtraAutoResult} LowlightAutoResult
 */

import high from 'highlight.js/lib/core.js'
import {fault} from 'fault'

var own = {}.hasOwnProperty

var defaultPrefix = 'hljs-'

/**
 * Parse `value` (code) according to the `language` (name) grammar.
 *
 * @param {string} language Language name
 * @param {string} value Code value
 * @param {LowlightOptions} [options={}] Settings
 * @returns {LowlightResult}
 */
function highlight(language, value, options = {}) {
  var prefix = options.prefix
  /** @type {HighlightResult & {emitter: HastEmitter}} */
  var result

  if (typeof language !== 'string') {
    throw fault('Expected `string` for name, got `%s`', language)
  }

  if (!high.getLanguage(language)) {
    throw fault('Unknown language: `%s` is not registered', language)
  }

  if (typeof value !== 'string') {
    throw fault('Expected `string` for value, got `%s`', value)
  }

  if (prefix === null || prefix === undefined) {
    prefix = defaultPrefix
  }

  high.configure({__emitter: HastEmitter, classPrefix: prefix})
  // @ts-ignore our emitter is added.
  result = high.highlight(value, {language, ignoreIllegals: true})
  high.configure({})

  // Highlight.js seems to use this (currently) for broken grammars, so let’s
  // keep it in there just to be sure.
  /* c8 ignore next 3 */
  if (result.errorRaised) {
    throw result.errorRaised
  }

  return {
    relevance: result.relevance,
    language: result.language,
    value: result.emitter.root.children
  }
}

/**
 * Parse `value` (code) by guessing its grammar.
 *
 * @param {string} value Code value
 * @param {LowlightAutoOptions} [options={}] Settings
 * @returns {LowlightAutoResult}
 */
function highlightAuto(value, options = {}) {
  var subset = options.subset || high.listLanguages()
  var prefix = options.prefix
  var index = -1
  /** @type {LowlightAutoResult} */
  var result = {relevance: 0, language: null, value: []}
  /** @type {LowlightResult} */
  var secondBest = {relevance: 0, language: null, value: []}
  /** @type {string} */
  var name
  /** @type {LowlightResult} */
  var current

  if (prefix === null || prefix === undefined) {
    prefix = defaultPrefix
  }

  if (typeof value !== 'string') {
    throw fault('Expected `string` for value, got `%s`', value)
  }

  while (++index < subset.length) {
    name = subset[index]

    if (!high.getLanguage(name)) {
      continue
    }

    current = highlight(name, value, options)
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

/**
 * Register a language.
 *
 * @param {string} language Language name
 * @param {LanguageFn} syntax Language syntax
 * @returns {void}
 */
function registerLanguage(language, syntax) {
  high.registerLanguage(language, syntax)
}

/**
 * Get a list of all registered languages.
 *
 * @returns {Array.<string>}
 */
function listLanguages() {
  return high.listLanguages()
}

const registerAlias =
  /**
   * @type {(
   *   ((language: string, alias: string|Array.<string>) => void) &
   *   ((aliases: Object<string, string|Array.<string>>) => void)
   * )}
   */
  (
    /**
     * Register more aliases for an already registered language.
     *
     * @param {string|Object<string, string|Array.<string>>} language
     * @param {string|Array.<string>} [alias]
     * @returns {void}
     */
    function (language, alias) {
      /** @type {Object<string, string|Array.<string>>} */
      var map
      /** @type {string} */
      var key

      if (typeof language === 'string') {
        map = {}
        map[language] = alias
      } else {
        map = language
      }

      for (key in map) {
        if (own.call(map, key)) {
          high.registerAliases(map[key], {languageName: key})
        }
      }
    }
  )

/** @type {Emitter} */
class HastEmitter {
  /**
   * @param {HLJSOptions} options
   */
  constructor(options) {
    /** @type {HLJSOptions} */
    this.options = options
    /** @type {LowlightRoot} */
    this.root = {type: 'root', children: []}
    /** @type {[LowlightRoot, ...LowlightElement[]]} */
    this.stack = [this.root]
  }

  /**
   * @param {string} value
   */
  addText(value) {
    /** @type {LowlightRoot|LowlightElement} */
    var current
    /** @type {LowlightElement|Text} */
    var tail

    if (value === '') return

    current = this.stack[this.stack.length - 1]
    tail = current.children[current.children.length - 1]

    if (tail && tail.type === 'text') {
      tail.value += value
    } else {
      current.children.push({type: 'text', value})
    }
  }

  /**
   * @param {string} value
   * @param {string} name
   */
  addKeyword(value, name) {
    this.openNode(name)
    this.addText(value)
    this.closeNode()
  }

  /**
   * @param {HastEmitter} other
   * @param {string} name
   */
  addSublanguage(other, name) {
    var current = this.stack[this.stack.length - 1]
    var results = other.root.children

    if (name) {
      current.children.push({
        type: 'element',
        tagName: 'span',
        properties: {className: [name]},
        children: results
      })
    } else {
      current.children.push(...results)
    }
  }

  /**
   * @param {string} name
   */
  openNode(name) {
    var className = this.options.classPrefix + name
    var current = this.stack[this.stack.length - 1]
    var child = {
      type: 'element',
      tagName: 'span',
      properties: {className: [className]},
      children: []
    }

    current.children.push(child)
    this.stack.push(child)
  }

  /**
   */
  closeNode() {
    this.stack.pop()
  }

  /**
   */
  closeAllNodes() {}

  /**
   */
  finalize() {}

  /**
   */
  toHTML() {
    return ''
  }
}

export const lowlight = {
  highlight,
  highlightAuto,
  registerLanguage,
  listLanguages,
  registerAlias
}
