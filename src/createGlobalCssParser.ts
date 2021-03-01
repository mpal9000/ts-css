import StylisParser from 'stylis'
import {
  OpaqueTag,
  NestedCss,
  CssRules,
  CssParserVendorPrefixOption,
} from './types.js'
import { isString } from './util.js'

export type CreateGlobalCssParserOptions = {
  readonly shouldVendorPrefix: CssParserVendorPrefixOption
  readonly compress: boolean
}

declare const GlobalCssParserTag: unique symbol
export type GlobalCssParser = ((nestedCss: NestedCss) => CssRules) &
  OpaqueTag<typeof GlobalCssParserTag>

export const createGlobalCssParser = (
  options: CreateGlobalCssParserOptions,
): GlobalCssParser => {
  const { shouldVendorPrefix, compress } = options

  const parse = new StylisParser({
    cascade: true,
    compress,
    global: false,
    keyframe: false,
    prefix: shouldVendorPrefix,
    preserve: true,
    semicolon: true,
  })

  // type-coverage:ignore-next-line
  return ((nestedCss) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const css = parse('', nestedCss) // type-coverage:ignore-line

    return isString(css) ? css : ''
  }) as GlobalCssParser
}
