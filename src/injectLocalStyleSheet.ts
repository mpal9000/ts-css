import { StyleElementAttributes } from './types.js'
import {
  joinCssRulesList,
  getDefaultStyleParentElement,
  createStyleElement,
  setStyleElementContent,
  insertStyleElement,
} from './util.js'
import { LocalStyleSheet } from './createLocalStyleSheet.js'

export type InjectLocalStyleSheetOptions = {
  readonly attributes?: StyleElementAttributes
  readonly replace?: boolean
  readonly parentElement?: HTMLElement
}

export function injectLocalStyleSheet<Selector extends string>(
  options: InjectLocalStyleSheetOptions,
  styleSheet: LocalStyleSheet<Selector>,
): LocalStyleSheet<Selector>
export function injectLocalStyleSheet<Selector extends string>(
  styleSheet: LocalStyleSheet<Selector>,
): LocalStyleSheet<Selector>
export function injectLocalStyleSheet<Selector extends string>(
  ...args:
    | readonly [InjectLocalStyleSheetOptions, LocalStyleSheet<Selector>]
    | readonly [LocalStyleSheet<Selector>]
): LocalStyleSheet<Selector> {
  const options: InjectLocalStyleSheetOptions = args.length === 2 ? args[0] : {}
  const styleSheet: LocalStyleSheet<Selector> =
    args.length === 2 ? args[1] : args[0]

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
