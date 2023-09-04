export type {AutoOptions, Options} from './lib/core.js'

export {lowlight} from './lib/common.js'

// Register data on hast.
declare module 'hast' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface RootData {
    /**
     * Field exposed by `lowlight` to contain the detected programming language
     * name.
     */
    language?: string | undefined

    /**
     * Field exposed by `lowlight` to contain a relevance: how sure `lowlight`
     * is that the given code is in the language.
     */
    relevance?: number | undefined
  }
}
