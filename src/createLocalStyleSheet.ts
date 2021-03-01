import { StyleSheetId, CssRules, ClassName } from './types.js'
import {
  isRecordWithUniqueKey,
  makeStyleSheetId,
  isStyleSheetId,
} from './util.js'
import {
  CreateLocalCssParserOptions,
  LocalCssParser,
  createLocalCssParser,
} from './createLocalCssParser.js'
import { LazyCssTemplateResult } from './css.js'

const LOCAL_STYLE_SHEET_SYMBOL = Symbol('LocalStyleSheet')

export type ClassNames<Selector extends string> = {
  readonly [P in Selector]: ClassName
}

export type LazyCssTemplateResults<Selector extends string> = {
  readonly [P in Selector]: LazyCssTemplateResult
}

export type CreateLocalStyleSheetOptions = {
  readonly id?: StyleSheetId
  readonly useGlobalKeyframes?: CreateLocalCssParserOptions['useGlobalKeyframes']
  readonly shouldVendorPrefix?: CreateLocalCssParserOptions['shouldVendorPrefix']
  readonly compress?: boolean
}

type LocalStyleSheetSettings = {
  readonly [K in Exclude<
    keyof CreateLocalStyleSheetOptions,
    'id'
  >]: Required<CreateLocalStyleSheetOptions>[K]
}

export type LocalStyleSheet<Selector extends string> = {
  readonly [LOCAL_STYLE_SHEET_SYMBOL]: true
  readonly id: StyleSheetId
  readonly classNames: ClassNames<Selector>
  readonly cssRulesList: readonly CssRules[]
  readonly settings: LocalStyleSheetSettings
}

export const isLocalStyleSheet = <Selector extends string>(
  value: unknown,
): value is LocalStyleSheet<Selector> => {
  return (
    isRecordWithUniqueKey(LOCAL_STYLE_SHEET_SYMBOL, value) &&
    value[LOCAL_STYLE_SHEET_SYMBOL] === true
  )
}

const combineLazyCssTemplateResults = <Selector extends string>(
  id: StyleSheetId,
  parser: LocalCssParser,
  lazyCssTemplateResults: LazyCssTemplateResults<Selector>,
) => {
  // type-coverage:ignore-next-line
  return (Object.entries(lazyCssTemplateResults) as [
    Selector,
    LazyCssTemplateResult,
  ][]).reduce<{
    readonly classNames: Partial<ClassNames<Selector>>
    readonly cssRulesList: readonly CssRules[]
  }>(
    (acc, [selector, lazyTemplateResult]) => {
      const { className, cssRules } = lazyTemplateResult.getValue({
        isGlobal: false,
        id,
        selector,
        parser,
      })

      // type-coverage:ignore-next-line
      const classNames = {
        [selector]: className,
      } as Partial<ClassNames<Selector>>

      return {
        classNames: { ...acc.classNames, ...classNames },
        cssRulesList: acc.cssRulesList.concat([cssRules]),
      }
    },
    { classNames: {}, cssRulesList: [] },
  ) as {
    readonly classNames: ClassNames<Selector>
    readonly cssRulesList: readonly CssRules[]
  }
}

export function createLocalStyleSheet<Selector extends string>(
  optionsOrId:
    | CreateLocalStyleSheetOptions
    | CreateLocalStyleSheetOptions['id'],
  lazyCssTemplateResults: LazyCssTemplateResults<Selector>,
): LocalStyleSheet<Selector>
export function createLocalStyleSheet<Selector extends string>(
  lazyCssTemplateResults: LazyCssTemplateResults<Selector>,
): LocalStyleSheet<Selector>
export function createLocalStyleSheet<Selector extends string>(
  ...args:
    | readonly [
        CreateLocalStyleSheetOptions | CreateLocalStyleSheetOptions['id'],
        LazyCssTemplateResults<Selector>,
      ]
    | readonly [LazyCssTemplateResults<Selector>]
): LocalStyleSheet<Selector> {
  const maybeOptionsOrId:
    | CreateLocalStyleSheetOptions
    | CreateLocalStyleSheetOptions['id'] = args.length === 2 ? args[0] : {}
  const lazyCssTemplateResults: LazyCssTemplateResults<Selector> =
    args.length === 2 ? args[1] : args[0]

  const options: CreateLocalStyleSheetOptions = isStyleSheetId(maybeOptionsOrId)
    ? { id: maybeOptionsOrId }
    : maybeOptionsOrId ?? {}
  const id = options.id ?? makeStyleSheetId()
  const {
    useGlobalKeyframes = false,
    shouldVendorPrefix = true,
    compress = false,
  } = options

  const { classNames, cssRulesList } = combineLazyCssTemplateResults(
    id,
    createLocalCssParser({ useGlobalKeyframes, shouldVendorPrefix, compress }),
    lazyCssTemplateResults,
  )

  return {
    [LOCAL_STYLE_SHEET_SYMBOL]: true,
    id,
    classNames,
    cssRulesList,
    settings: { useGlobalKeyframes, shouldVendorPrefix, compress },
  }
}
