import { murmur3 } from 'murmurhash-js'
import {
  UnknownRecord,
  StyleSheetId,
  NestedCss,
  CssRules,
  ClassName,
  StyleElementAttributes,
} from './types.js'
import { cacheValue } from './cache.js'

type JoinCssRulesListOptions = {
  readonly compress: boolean
}

type CreateStyleElementOptions = {
  readonly id: StyleSheetId
  readonly attributes: StyleElementAttributes
}

type InsertStyleElementOptions = {
  readonly id: StyleSheetId
  readonly replace: boolean
}

const GLOBAL_CACHE_KEY = Symbol('GLOBAL_CACHE_KEY')

const CACHE = cacheValue(GLOBAL_CACHE_KEY, { idCount: 0 })

const hasKey = (key: PropertyKey, object: UnknownRecord): boolean => {
  return Object.prototype.hasOwnProperty.call(object, key)
}

export const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

const isUnknownRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const isRecordWithUniqueKey = <Key extends symbol>(
  key: Key,
  value: unknown,
): value is { readonly [key in Key]: unknown } => {
  return isUnknownRecord(value) && hasKey(key, value)
}

export const isStyleSheetId = (value: unknown): value is StyleSheetId => {
  return isString(value)
}

export const isNestedCss = (value: unknown): value is NestedCss => {
  return isString(value)
}

export const isCssRules = (value: unknown): value is CssRules => {
  return isString(value)
}

export const isClassName = (value: unknown): value is ClassName => {
  return isString(value)
}

export const makeStyleSheetId = (
  prefix?: string,
  id?: string,
): StyleSheetId => {
  const idToHash =
    id === undefined || id === '' ? `id-${(CACHE.idCount += 1)}` : id

  // type-coverage:ignore-next-line
  return `${prefix !== undefined ? `${prefix}-` : ''}${murmur3(
    idToHash,
    idToHash.length,
  ).toString(36)}` as StyleSheetId
}

export const makeClassName = (
  id: StyleSheetId,
  selector: string,
): ClassName => {
  // type-coverage:ignore-next-line
  return `${id}-${selector}` as ClassName
}

export const joinCssRulesList = (
  options: JoinCssRulesListOptions,
  cssRulesList: readonly CssRules[],
): CssRules => {
  const { compress } = options

  // type-coverage:ignore-next-line
  return cssRulesList.join(compress ? '' : '\n') as CssRules
}

export const getDefaultStyleParentElement = (): HTMLHeadElement => {
  return document.head
}

export const createStyleElement = (
  options: CreateStyleElementOptions,
): HTMLStyleElement => {
  const { id, attributes } = options
  const styleElement = document.createElement('style')

  styleElement.id = id

  Object.entries(attributes).forEach(([key, value]) => {
    styleElement.setAttribute(key, value)
  })

  return styleElement
}

export const setStyleElementContent = <T extends HTMLStyleElement>(
  cssRules: CssRules,
  styleElement: T,
): T => {
  styleElement.appendChild(document.createTextNode(cssRules))
  return styleElement
}

const appendStyleElement = <T extends HTMLElement>(
  styleElement: HTMLStyleElement,
  parentElement: T,
): T => {
  parentElement.appendChild(styleElement)
  return parentElement
}

const replaceStyleElement = <T extends HTMLElement>(
  styleElement: HTMLStyleElement,
  existingStyleElement: HTMLStyleElement | null,
  parentElement: T,
): T => {
  if (existingStyleElement === null) {
    return appendStyleElement(styleElement, parentElement)
  }

  parentElement.replaceChild(styleElement, existingStyleElement)

  return parentElement
}

export const insertStyleElement = <T extends HTMLElement>(
  options: InsertStyleElementOptions,
  styleElement: HTMLStyleElement,
  parentElement: T,
): T => {
  const { id, replace } = options

  const existingStyleElement = parentElement.querySelector<HTMLStyleElement>(
    `style#${id}`,
  )

  if (!replace && existingStyleElement !== null) {
    throw new Error(`A style element with id '${id}' already exist.`)
  }

  return replaceStyleElement(styleElement, existingStyleElement, parentElement)
}

export const removeStyleElement = <T extends HTMLStyleElement>(
  styleElement: T,
): T => {
  if (styleElement.parentNode !== null) {
    styleElement.parentNode.removeChild(styleElement)
  }

  return styleElement
}
