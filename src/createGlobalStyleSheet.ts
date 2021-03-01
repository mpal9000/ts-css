import { StyleSheetId, CssRules } from './types.js'
import {
  isRecordWithUniqueKey,
  makeStyleSheetId,
  isStyleSheetId,
} from './util.js'
import {
  CreateGlobalCssParserOptions,
  createGlobalCssParser,
} from './createGlobalCssParser.js'
import { LazyCssTemplateResult } from './css.js'

const GLOBAL_STYLE_SHEET_SYMBOL = Symbol('GlobalStyleSheet')

export type CreateGlobalStyleSheetOptions = {
  readonly id?: StyleSheetId
  readonly shouldVendorPrefix?: CreateGlobalCssParserOptions['shouldVendorPrefix']
  readonly compress?: boolean
}

type GlobalStyleSheetSettings = {
  readonly [K in Exclude<
    keyof CreateGlobalStyleSheetOptions,
    'id'
  >]: Required<CreateGlobalStyleSheetOptions>[K]
}

export type GlobalStyleSheet = {
  readonly [GLOBAL_STYLE_SHEET_SYMBOL]: true
  readonly id: StyleSheetId
  readonly cssRulesList: readonly CssRules[]
  readonly settings: GlobalStyleSheetSettings
}

export const isGlobalStyleSheet = (
  value: unknown,
): value is GlobalStyleSheet => {
  return (
    isRecordWithUniqueKey(GLOBAL_STYLE_SHEET_SYMBOL, value) &&
    value[GLOBAL_STYLE_SHEET_SYMBOL] === true
  )
}

export function createGlobalStyleSheet(
  optionsOrId:
    | CreateGlobalStyleSheetOptions
    | CreateGlobalStyleSheetOptions['id'],
  lazyCssTemplateResult: LazyCssTemplateResult,
): GlobalStyleSheet
export function createGlobalStyleSheet(
  lazyCssTemplateResult: LazyCssTemplateResult,
): GlobalStyleSheet
export function createGlobalStyleSheet(
  ...args:
    | readonly [
        CreateGlobalStyleSheetOptions | CreateGlobalStyleSheetOptions['id'],
        LazyCssTemplateResult,
      ]
    | readonly [LazyCssTemplateResult]
): GlobalStyleSheet {
  const maybeOptionsOrId:
    | CreateGlobalStyleSheetOptions
    | CreateGlobalStyleSheetOptions['id'] = args.length === 2 ? args[0] : {}
  const lazyCssTemplateResult: LazyCssTemplateResult =
    args.length === 2 ? args[1] : args[0]

  const options: CreateGlobalStyleSheetOptions = isStyleSheetId(
    maybeOptionsOrId,
  )
    ? { id: maybeOptionsOrId }
    : maybeOptionsOrId ?? {}
  const id = options.id ?? makeStyleSheetId()
  const { shouldVendorPrefix = true, compress = false } = options

  const { cssRules } = lazyCssTemplateResult.getValue({
    isGlobal: true,
    parser: createGlobalCssParser({ shouldVendorPrefix, compress }),
  })

  return {
    [GLOBAL_STYLE_SHEET_SYMBOL]: true,
    id,
    cssRulesList: [cssRules],
    settings: { shouldVendorPrefix, compress },
  }
}
