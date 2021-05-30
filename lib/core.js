/**
 * @typedef {import('hast').Text} Text
 *
 * @typedef {import('highlight.js').HighlightResult} HighlightResult
 * @typedef {import('highlight.js').HLJSOptions} HighlightOptions
 * @typedef {import('highlight.js').LanguageFn} HighlightSyntax
 * @typedef {import('highlight.js').Emitter} HighlightEmitter
 *
 * @typedef {{type: 'element', tagName: 'span', properties: {className: Array.<string>}, children: Array.<LowlightElementSpan|Text>}} LowlightElementSpan
 * @typedef {{type: 'root', data: {language: string, relevance: number}, children: Array.<LowlightElementSpan|Text>}} LowlightRoot
 *
 * @typedef {Object} ExtraAutoOptions
 * @property {Array.<string>} [subset] List of allowed languages; defaults to all registered languages
 *
 * @typedef {Object} LowlightOptions
 * @property {string} [prefix='hljs-'] Class prefix
 *
 * @typedef {LowlightOptions & ExtraAutoOptions} LowlightAutoOptions
 */

import high from 'highlight.js/lib/core'
import {fault} from 'fault'

const own = {}.hasOwnProperty

const defaultPrefix = 'hljs-'

/**
 * Parse `value` (code) according to the `language` (name) grammar.
 *
 * @param {string} language Language name
 * @param {string} value Code value
 * @param {LowlightOptions} [options={}] Settings
 * @returns {LowlightRoot}
 */
function highlight(language, value, options = {}) {
  let prefix = options.prefix

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
  /** @type {HighlightResult & {_emitter: HastEmitter}} */
  // @ts-ignore our emitter is added.
  const result = high.highlight(value, {language, ignoreIllegals: true})
  high.configure({})

  // Highlight.js seems to use this (currently) for broken grammars, so let’s
  // keep it in there just to be sure.
  /* c8 ignore next 3 */
  if (result.errorRaised) {
    throw result.errorRaised
  }

  result._emitter.root.data.language = result.language
  result._emitter.root.data.relevance = result.relevance

  return result._emitter.root
}

/**
 * Parse `value` (code) by guessing its grammar.
 *
 * @param {string} value Code value
 * @param {LowlightAutoOptions} [options={}] Settings
 * @returns {LowlightRoot}
 */
function highlightAuto(value, options = {}) {
  const subset = options.subset || high.listLanguages()
  let prefix = options.prefix
  let index = -1
  /** @type {LowlightRoot} */
  let result = {
    type: 'root',
    data: {language: null, relevance: 0},
    children: []
  }
  /** @type {string} */
  let name
  /** @type {LowlightRoot} */
  let current

  if (prefix === null || prefix === undefined) {
    prefix = defaultPrefix
  }

  if (typeof value !== 'string') {
    throw fault('Expected `string` for value, got `%s`', value)
  }

  while (++index < subset.length) {
    name = subset[index]

    if (!high.getLanguage(name)) continue

    current = highlight(name, value, options)

    if (current.data.relevance > result.data.relevance) result = current
  }

  return result
}

/**
 * Register a language.
 *
 * @param {string} language Language name
 * @param {HighlightSyntax} syntax Language syntax
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
      let map
      /** @type {string} */
      let key

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

/** @type {HighlightEmitter} */
class HastEmitter {
  /**
   * @param {HighlightOptions} options
   */
  constructor(options) {
    /** @type {HighlightOptions} */
    this.options = options
    /** @type {LowlightRoot} */
    this.root = {
      type: 'root',
      data: {language: undefined, relevance: 0},
      children: []
    }
    /** @type {[LowlightRoot, ...LowlightElementSpan[]]} */
    this.stack = [this.root]
  }

  /**
   * @param {string} value
   */
  addText(value) {
    if (value === '') return

    const current = this.stack[this.stack.length - 1]
    const tail = current.children[current.children.length - 1]

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
    const current = this.stack[this.stack.length - 1]
    const results = other.root.children

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
    const className = name.split('.').map((d) => this.options.classPrefix + d)
    const current = this.stack[this.stack.length - 1]
    /** @type {LowlightElementSpan} */
    const child = {
      type: 'element',
      tagName: 'span',
      properties: {className},
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
