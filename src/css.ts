import { StyleSheetId, NestedCss, CssRules, ClassName } from './types.js'
import { isRecordWithUniqueKey, makeClassName } from './util.js'
import { GlobalCssParser } from './createGlobalCssParser.js'
import { LocalCssParser } from './createLocalCssParser.js'

const GLOBAL_CSS_TEMPLATE_RESULT_SYMBOL = Symbol('GlobalCssTemplateResult')
const LOCAL_CSS_TEMPLATE_RESULT_SYMBOL = Symbol('LocalCssTemplateResult')
const LAZY_CSS_TEMPLATE_RESULT_SYMBOL = Symbol('LazyCssTemplateResult')

export type GlobalCssTemplateResultOptions = {
  readonly isGlobal: true
  readonly parser: GlobalCssParser
}

export type LocalCssTemplateResultOptions = {
  readonly isGlobal: false
  readonly id: StyleSheetId
  readonly selector: string
  readonly parser: LocalCssParser
}

export type GlobalCssTemplateResult = {
  readonly [GLOBAL_CSS_TEMPLATE_RESULT_SYMBOL]: true
  readonly className: undefined
  readonly cssRules: CssRules
}

export type LocalCssTemplateResult = {
  readonly [LOCAL_CSS_TEMPLATE_RESULT_SYMBOL]: true
  readonly className: ClassName
  readonly cssRules: CssRules
}

export type LazyCssTemplateResult = {
  readonly [LAZY_CSS_TEMPLATE_RESULT_SYMBOL]: true
  readonly getValue: {
    (options: GlobalCssTemplateResultOptions): GlobalCssTemplateResult
    (options: LocalCssTemplateResultOptions): LocalCssTemplateResult
    (): NestedCss
  }
}

export const isGlobalCssTemplateResult = (
  value: unknown,
): value is GlobalCssTemplateResult => {
  return (
    isRecordWithUniqueKey(GLOBAL_CSS_TEMPLATE_RESULT_SYMBOL, value) &&
    value[GLOBAL_CSS_TEMPLATE_RESULT_SYMBOL] === true
  )
}

export const isLocalCssTemplateResult = (
  value: unknown,
): value is LocalCssTemplateResult => {
  return (
    isRecordWithUniqueKey(LOCAL_CSS_TEMPLATE_RESULT_SYMBOL, value) &&
    value[LOCAL_CSS_TEMPLATE_RESULT_SYMBOL] === true
  )
}

export const isLazyCssTemplateResult = (
  value: unknown,
): value is LazyCssTemplateResult => {
  return (
    isRecordWithUniqueKey(LAZY_CSS_TEMPLATE_RESULT_SYMBOL, value) &&
    value[LAZY_CSS_TEMPLATE_RESULT_SYMBOL] === true
  )
}

const compileCssTemplate = (
  strings: TemplateStringsArray,
  substitutions: readonly unknown[],
): NestedCss => {
  // type-coverage:ignore-next-line
  return substitutions.reduce<string>((acc, substitution, index) => {
    if (isLazyCssTemplateResult(substitution)) {
      const nestedCss: string = substitution.getValue()
      return acc + nestedCss + (strings[index + 1] ?? '')
    }

    return acc + String(substitution) + (strings[index + 1] ?? '')
  }, strings[0] ?? '') as NestedCss
}

const parseGlobalCss = (
  parser: GlobalCssParser,
  nestedCss: NestedCss,
): CssRules => {
  return parser(nestedCss)
}

const parseLocalCss = (
  parser: LocalCssParser,
  className: ClassName,
  nestedCss: NestedCss,
): CssRules => {
  return parser(className, nestedCss)
}

const getGlobalCssTemplateResult = (
  options: GlobalCssTemplateResultOptions,
  nestedCss: NestedCss,
): GlobalCssTemplateResult => {
  const { parser } = options

  return {
    [GLOBAL_CSS_TEMPLATE_RESULT_SYMBOL]: true,
    className: undefined,
    cssRules: parseGlobalCss(parser, nestedCss),
  }
}

const getLocalCssTemplateResult = (
  options: LocalCssTemplateResultOptions,
  nestedCss: NestedCss,
): LocalCssTemplateResult => {
  const { id, selector, parser } = options
  const className = makeClassName(id, selector)

  return {
    [LOCAL_CSS_TEMPLATE_RESULT_SYMBOL]: true,
    className,
    cssRules: parseLocalCss(parser, className, nestedCss),
  }
}

export const css = (
  strings: TemplateStringsArray,
  ...substitutions: readonly unknown[]
): LazyCssTemplateResult => {
  function getCssTemplateResult(
    options: GlobalCssTemplateResultOptions,
  ): GlobalCssTemplateResult
  function getCssTemplateResult(
    options: LocalCssTemplateResultOptions,
  ): LocalCssTemplateResult
  function getCssTemplateResult(): NestedCss
  function getCssTemplateResult(
    options?: GlobalCssTemplateResultOptions | LocalCssTemplateResultOptions,
  ) {
    const nestedCss = compileCssTemplate(strings, substitutions)

    if (options === undefined) {
      return nestedCss
    }

    return options.isGlobal
      ? getGlobalCssTemplateResult(options, nestedCss)
      : getLocalCssTemplateResult(options, nestedCss)
  }

  return {
    [LAZY_CSS_TEMPLATE_RESULT_SYMBOL]: true,
    getValue: getCssTemplateResult,
  }
}
