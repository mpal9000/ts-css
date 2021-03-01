import StylisParser from 'stylis'
import {
  OpaqueTag,
  NestedCss,
  CssRules,
  ClassName,
  CssParserVendorPrefixOption,
} from './types.js'
import { isString } from './util.js'

export type CreateLocalCssParserOptions = {
  readonly useGlobalKeyframes: boolean
  readonly shouldVendorPrefix: CssParserVendorPrefixOption
  readonly compress: boolean
}

declare const LocalCssParserTag: unique symbol
export type LocalCssParser = ((
  className: ClassName,
  nestedCss: NestedCss,
) => CssRules) &
  OpaqueTag<typeof LocalCssParserTag>

export const createLocalCssParser = (
  options: CreateLocalCssParserOptions,
): LocalCssParser => {
  const { useGlobalKeyframes, shouldVendorPrefix, compress } = options

  const parse = new StylisParser({
    cascade: true,
    compress,
    global: true,
    keyframe: !useGlobalKeyframes,
    prefix: shouldVendorPrefix,
    preserve: true,
    semicolon: true,
  })

  // type-coverage:ignore-next-line
  return ((className, nestedCss) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const css = parse(`.${className}`, nestedCss) // type-coverage:ignore-line

    return isString(css) ? css : ''
  }) as LocalCssParser
}
