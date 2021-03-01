import { StyleElementAttributes } from './types.js'
import {
  joinCssRulesList,
  getDefaultStyleParentElement,
  createStyleElement,
  setStyleElementContent,
  insertStyleElement,
} from './util.js'
import { GlobalStyleSheet } from './createGlobalStyleSheet.js'

export type InjectGlobalStyleSheetOptions = {
  readonly attributes?: StyleElementAttributes
  readonly replace?: boolean
  readonly parentElement?: HTMLElement
}

export function injectGlobalStyleSheet(
  options: InjectGlobalStyleSheetOptions,
  styleSheet: GlobalStyleSheet,
): GlobalStyleSheet
export function injectGlobalStyleSheet(
  styleSheet: GlobalStyleSheet,
): GlobalStyleSheet
export function injectGlobalStyleSheet(
  ...args:
    | readonly [InjectGlobalStyleSheetOptions, GlobalStyleSheet]
    | readonly [GlobalStyleSheet]
): GlobalStyleSheet {
  const options: InjectGlobalStyleSheetOptions =
    args.length === 2 ? args[0] : {}
  const styleSheet: GlobalStyleSheet = args.length === 2 ? args[1] : args[0]

  const {
    attributes = {},
    replace = true,
    parentElement = getDefaultStyleParentElement(),
  } = options
  const { id, cssRulesList } = styleSheet

  insertStyleElement(
    { id, replace },
    setStyleElementContent(
      joinCssRulesList(
        { compress: styleSheet.settings.compress },
        cssRulesList,
      ),
      createStyleElement({ id, attributes }),
    ),
    parentElement,
  )

  return styleSheet
}
