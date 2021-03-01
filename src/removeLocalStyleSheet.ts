import { getDefaultStyleParentElement, removeStyleElement } from './util.js'
import { LocalStyleSheet } from './createLocalStyleSheet.js'

export type RemoveLocalStyleSheetOptions = {
  readonly parentElement?: HTMLElement
}

export function removeLocalStyleSheet<Selector extends string>(
  options: RemoveLocalStyleSheetOptions,
  styleSheet: LocalStyleSheet<Selector>,
): void
export function removeLocalStyleSheet<Selector extends string>(
  styleSheet: LocalStyleSheet<Selector>,
): void
export function removeLocalStyleSheet<Selector extends string>(
  ...args:
    | readonly [RemoveLocalStyleSheetOptions, LocalStyleSheet<Selector>]
    | readonly [LocalStyleSheet<Selector>]
): void {
  const options: RemoveLocalStyleSheetOptions = args.length === 2 ? args[0] : {}
  const styleSheet: LocalStyleSheet<Selector> =
    args.length === 2 ? args[1] : args[0]

  const { parentElement = getDefaultStyleParentElement() } = options
  const { id } = styleSheet

  const styleElement = parentElement.querySelector<HTMLStyleElement>(
    `style#${id}`,
  )

  if (styleElement !== null) {
    removeStyleElement(styleElement)
  }
}
