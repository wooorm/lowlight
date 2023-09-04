/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').ElementContent} ElementContent
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').RootData} RootData
 * @typedef {import('highlight.js').HighlightResult} HighlightResult
 * @typedef {import('highlight.js').HLJSOptions} HighlightOptions
 * @typedef {import('highlight.js').LanguageFn} HighlightSyntax
 * @typedef {import('highlight.js').Emitter} HighlightEmitter
 *
 * @typedef {Object} ExtraOptions
 * @property {Array<string>} [subset]
 *   List of allowed languages, defaults to all registered languages.
 *
 * @typedef {Object} Options
 *   Configuration.
 * @property {string} [prefix='hljs-']
 *   Class prefix.
 *
 * @typedef {Options & ExtraOptions} AutoOptions
 */

import highlightCore from 'highlight.js/lib/core'

// Create an own instance to not be in conflict with the global object
const high = highlightCore.newInstance()

const own = {}.hasOwnProperty

const defaultPrefix = 'hljs-'

/**
 * Highlight `value` (code) as `language` (name).
 *
 * @param {string} language
 *   Programming language name.
 * @param {string} value
 *   Code to highlight.
 * @param {Options} [options={}]
 *   Configuration.
 * @returns {Root}
 *   A hast `Root` node.
 */
function highlight(language, value, options = {}) {
  let prefix = options.prefix

  if (typeof language !== 'string') {
    // eslint-disable-next-line unicorn/prefer-type-error
    throw new Error('Expected `string` for name, got `' + language + '`')
  }

  if (!high.getLanguage(language)) {
    throw new Error('Unknown language: `' + language + '` is not registered')
  }

  if (typeof value !== 'string') {
    // eslint-disable-next-line unicorn/prefer-type-error
    throw new Error('Expected `string` for value, got `' + value + '`')
  }

  if (prefix === null || prefix === undefined) {
    prefix = defaultPrefix
  }

  // @ts-expect-error: Types out of date.
  // See: <https://github.com/highlightjs/highlight.js/issues/3621#issuecomment-1528841888>
  high.configure({__emitter: HastEmitter, classPrefix: prefix})

  const result = /** @type {HighlightResult & {_emitter: HastEmitter}} */ (
    high.highlight(value, {language, ignoreIllegals: true})
  )

  // `highlight.js` seems to use this (currently) for broken grammars, so let’s
  // keep it in there just to be sure.
  /* c8 ignore next 3 */
  if (result.errorRaised) {
    throw result.errorRaised
  }

  const root = result._emitter.root

  // Cast because it is always defined.
  const data = /** @type {RootData} */ (root.data)

  data.language = result.language
  data.relevance = result.relevance

  return root
}

/**
 * Highlight `value` (code) and guess its programming language.
 *
 * @param {string} value
 *   Code to highlight.
 * @param {AutoOptions} [options={}]
 *   Configuration.
 * @returns {Root}
 *   A hast `Root` node.
 */
function highlightAuto(value, options = {}) {
  const subset = options.subset || high.listLanguages()
  let prefix = options.prefix
  let index = -1
  let relevance = 0
  /** @type {Root} */
  let result = {
    type: 'root',
    children: []
  }

  if (prefix === null || prefix === undefined) {
    prefix = defaultPrefix
  }

  if (typeof value !== 'string') {
    // eslint-disable-next-line unicorn/prefer-type-error
    throw new Error('Expected `string` for value, got `' + value + '`')
  }

  while (++index < subset.length) {
    const name = subset[index]

    if (!high.getLanguage(name)) continue

    const current = highlight(name, value, options)

    if (
      current.data &&
      current.data.relevance !== undefined &&
      current.data.relevance > relevance
    ) {
      relevance = current.data.relevance
      result = current
    }
  }

  if (!result.data) {
    result.data = {language: undefined, relevance: 0}
  }

  return result
}

/**
 * Register a language.
 *
 * @param {string} language
 *   Programming language name.
 * @param {HighlightSyntax} syntax
 *   `highlight.js` language syntax.
 * @returns {void}
 */
function registerLanguage(language, syntax) {
  high.registerLanguage(language, syntax)
}

/**
 * Register aliases for already registered languages.
 *
 * @param {string|Record<string, string|Array<string>>} language
 *   Programming language name or a map of `language`s to `alias`es or `list`s
 * @param {string|Array<string>} [alias]
 *   New aliases for the programming language.
 * @returns {void}
 */
const registerAlias =
  /**
   * @type {(
   *   ((language: string, alias: string|Array<string>) => void) &
   *   ((aliases: Record<string, string|Array<string>>) => void)
   * )}
   */
  (
    /**
     * @param {string|Record<string, string|Array<string>>} language
     * @param {string|Array<string>} [alias]
     * @returns {void}
     */
    function (language, alias) {
      if (typeof language === 'string') {
        // @ts-expect-error: should be a string in this overload.
        high.registerAliases(alias, {languageName: language})
      } else {
        /** @type {string} */
        let key

        for (key in language) {
          if (own.call(language, key)) {
            high.registerAliases(language[key], {languageName: key})
          }
        }
      }
    }
  )

/**
 * Check whether an `alias` or `language` is registered.
 *
 * @param {string} aliasOrLanguage
 *   Name of a registered language or alias.
 * @returns {boolean}
 *   Whether `aliasOrlanguage` is registered.
 */
function registered(aliasOrLanguage) {
  return Boolean(high.getLanguage(aliasOrLanguage))
}

/**
 * List registered languages.
 *
 * @returns {Array<string>}
 *   Names of registered language.
 */
function listLanguages() {
  return high.listLanguages()
}

/** @type {HighlightEmitter} */
class HastEmitter {
  /**
   * @param {HighlightOptions} options
   */
  constructor(options) {
    /** @type {HighlightOptions} */
    this.options = options
    /** @type {Root} */
    this.root = {
      type: 'root',
      data: {language: undefined, relevance: 0},
      children: []
    }
    /** @type {[Root, ...Array<Element>]} */
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
   *
   * @param {unknown} rawName
   */
  startScope(rawName) {
    this.openNode(String(rawName))
  }

  /**
   */
  endScope() {
    this.closeNode()
  }

  /**
   * @param {HastEmitter} other
   * @param {string} name
   */
  __addSublanguage(other, name) {
    const current = this.stack[this.stack.length - 1]
    // Assume only element content.
    const results = /** @type {Array<ElementContent>} */ (other.root.children)

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
    // First “class” gets the prefix. Rest gets a repeated underscore suffix.
    // See: <https://github.com/highlightjs/highlight.js/commit/51806aa>
    // See: <https://github.com/wooorm/lowlight/issues/43>
    const className = name
      .split('.')
      .map((d, i) => (i ? d + '_'.repeat(i) : this.options.classPrefix + d))
    const current = this.stack[this.stack.length - 1]
    /** @type {Element} */
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
  registered,
  listLanguages,
  registerAlias
}
