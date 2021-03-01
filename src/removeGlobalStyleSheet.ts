import { getDefaultStyleParentElement, removeStyleElement } from './util.js'
import { GlobalStyleSheet } from './createGlobalStyleSheet.js'

export type RemoveGlobalStyleSheetOptions = {
  readonly parentElement?: HTMLElement
}

export function removeGlobalStyleSheet(
  options: RemoveGlobalStyleSheetOptions,
  styleSheet: GlobalStyleSheet,
): void
export function removeGlobalStyleSheet(styleSheet: GlobalStyleSheet): void
export function removeGlobalStyleSheet(
  ...args:
    | readonly [RemoveGlobalStyleSheetOptions, GlobalStyleSheet]
    | readonly [GlobalStyleSheet]
): void {
  const options: RemoveGlobalStyleSheetOptions =
    args.length === 2 ? args[0] : {}
  const styleSheet: GlobalStyleSheet = args.length === 2 ? args[1] : args[0]

  const { parentElement = getDefaultStyleParentElement() } = options
  const { id } = styleSheet

  const styleElement = parentElement.querySelector<HTMLStyleElement>(
    `style#${id}`,
  )

  if (styleElement !== null) {
    removeStyleElement(styleElement)
  }
}
