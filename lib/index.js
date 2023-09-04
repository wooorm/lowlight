/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').ElementContent} ElementContent
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').RootData} RootData
 *
 * @typedef {import('highlight.js').Emitter} Emitter
 * @typedef {import('highlight.js').HLJSOptions} HljsOptions
 * @typedef {import('highlight.js').HighlightResult} HighlightResult
 * @typedef {import('highlight.js').LanguageFn} LanguageFn
 */

/**
 * @typedef {Object} ExtraOptions
 *   Extra fields.
 * @property {ReadonlyArray<string> | null | undefined} [subset]
 *   List of allowed languages (default: all registered languages).
 *
 * @typedef {Object} Options
 *   Configuration for `highlight`.
 * @property {string | null | undefined} [prefix='hljs-']
 *   Class prefix (default: `'hljs-'`).
 *
 * @typedef {Options & ExtraOptions} AutoOptions
 *   Configuration for `highlightAuto`.
 */

import {ok as assert} from 'devlop'
import HighlightJs from 'highlight.js/lib/core'

/** @type {AutoOptions} */
const emptyOptions = {}

const defaultPrefix = 'hljs-'

/**
 * Create a `lowlight` instance.
 *
 * @param {Readonly<Record<string, LanguageFn>> | null | undefined} [grammars]
 *   Grammars to add (optional).
 * @returns
 *   Lowlight.
 */
export function createLowlight(grammars) {
  const high = HighlightJs.newInstance()

  if (grammars) {
    register(grammars)
  }

  return {
    highlight,
    highlightAuto,
    listLanguages,
    register,
    registerAlias,
    registered
  }

  /**
   * Highlight `value` (code) as `language` (name).
   *
   * @param {string} language
   *   Programming language name.
   * @param {string} value
   *   Code to highlight.
   * @param {Readonly<Options> | null | undefined} [options={}]
   *   Configuration (optional).
   * @returns {Root}
   *   A hast `Root` node.
   */
  function highlight(language, value, options) {
    assert(typeof language === 'string', 'expected `string` as `name`')
    assert(typeof value === 'string', 'expected `string` as `value`')

    const settings = options || emptyOptions
    const prefix =
      typeof settings.prefix === 'string' ? settings.prefix : defaultPrefix

    if (!high.getLanguage(language)) {
      throw new Error('Unknown language: `' + language + '` is not registered')
    }

    // @ts-expect-error: `__emitter` works but isn’t typed.
    // See: <https://github.com/highlightjs/highlight.js/issues/3621#issuecomment-1528841888>
    high.configure({__emitter: HastEmitter, classPrefix: prefix})

    const result = /** @type {HighlightResult & {_emitter: HastEmitter}} */ (
      high.highlight(value, {ignoreIllegals: true, language})
    )

    // `highlight.js` seems to use this (currently) for broken grammars, so let’s
    // keep it in there just to be sure.
    /* c8 ignore next 5 */
    if (result.errorRaised) {
      throw new Error('Could not highlight with `Highlight.js`', {
        cause: result.errorRaised
      })
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
   * @param {Readonly<AutoOptions> | null | undefined} [options={}]
   *   Configuration (optional).
   * @returns {Root}
   *   A hast `Root` node.
   */
  function highlightAuto(value, options) {
    assert(typeof value === 'string', 'expected `string` as `value`')

    const settings = options || emptyOptions
    const subset = settings.subset || listLanguages()

    let index = -1
    let relevance = 0
    /** @type {Root} */
    let result = {type: 'root', children: []}

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
      result.data = {language: undefined, relevance}
    }

    return result
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

  /**
   * Register languages.
   *
   * @overload
   * @param {Readonly<Record<string, LanguageFn>>} languageMap
   * @returns {undefined}
   *
   * @overload
   * @param {string} name
   * @param {LanguageFn} language
   * @returns {undefined}
   *
   * @param {Readonly<Record<string, LanguageFn>> | string} languageMapOrName
   *   Programming language name or a map of names to language functions.
   * @param {LanguageFn | undefined} [languageFn]
   *   Language function, if with name.
   * @returns {undefined}
   *   Nothing.
   */
  function register(languageMapOrName, languageFn) {
    if (typeof languageMapOrName === 'string') {
      assert(languageFn !== undefined, 'expected `languageFn`')
      high.registerLanguage(languageMapOrName, languageFn)
    } else {
      /** @type {string} */
      let name

      for (name in languageMapOrName) {
        if (Object.hasOwn(languageMapOrName, name)) {
          high.registerLanguage(name, languageMapOrName[name])
        }
      }
    }
  }

  /**
   * Register aliases.
   *
   * @overload
   * @param {Readonly<Record<string, ReadonlyArray<string> | string>>} aliaseMap
   * @returns {undefined}
   *
   * @overload
   * @param {string} language
   * @param {ReadonlyArray<string> | string} aliases
   * @returns {undefined}
   *
   * @param {Readonly<Record<string, ReadonlyArray<string> | string>> | string} language
   *   Programming language name or a map of `language`s to `alias`es or `list`s
   * @param {ReadonlyArray<string> | string | undefined} [alias]
   *   New aliases for the programming language.
   * @returns {undefined}
   *   Nothing.
   */
  function registerAlias(language, alias) {
    if (typeof language === 'string') {
      assert(alias !== undefined)
      high.registerAliases(
        // Note: copy needed because hljs doesn’t accept readonly arrays yet.
        typeof alias === 'string' ? alias : [...alias],
        {languageName: language}
      )
    } else {
      /** @type {string} */
      let key

      for (key in language) {
        if (Object.hasOwn(language, key)) {
          const aliases = language[key]
          high.registerAliases(
            // Note: copy needed because hljs doesn’t accept readonly arrays yet.
            typeof aliases === 'string' ? aliases : [...aliases],
            {languageName: key}
          )
        }
      }
    }
  }

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
}

/** @type {Emitter} */
class HastEmitter {
  /**
   * @param {Readonly<HljsOptions>} options
   *   Configuration.
   * @returns
   *   Instance.
   */
  constructor(options) {
    /** @type {HljsOptions} */
    this.options = options
    /** @type {Root} */
    this.root = {
      type: 'root',
      children: [],
      data: {language: undefined, relevance: 0}
    }
    /** @type {[Root, ...Array<Element>]} */
    this.stack = [this.root]
  }

  /**
   * @param {string} value
   *   Text to add.
   * @returns {undefined}
   *   Nothing.
   *
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
   *   Name to add.
   * @returns {undefined}
   *   Nothing.
   */
  startScope(rawName) {
    this.openNode(String(rawName))
  }

  /**
   * @returns {undefined}
   *   Nothing.
   */
  endScope() {
    this.closeNode()
  }

  /**
   * @param {HastEmitter} other
   *   Other emitter.
   * @param {string} name
   *   Name of the sublanguage.
   * @returns {undefined}
   *   Nothing.
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
   *   Name to add.
   * @returns {undefined}
   *   Nothing.
   */
  openNode(name) {
    const self = this
    // First “class” gets the prefix. Rest gets a repeated underscore suffix.
    // See: <https://github.com/highlightjs/highlight.js/commit/51806aa>
    // See: <https://github.com/wooorm/lowlight/issues/43>
    const className = name.split('.').map(function (d, i) {
      return i ? d + '_'.repeat(i) : self.options.classPrefix + d
    })
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
   * @returns {undefined}
   *   Nothing.
   */
  closeNode() {
    this.stack.pop()
  }

  /**
   * @returns {undefined}
   *   Nothing.
   */
  finalize() {}

  /**
   * @returns {string}
   *   Nothing.
   */
  toHTML() {
    return ''
  }
}
