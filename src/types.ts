export type UnknownRecord = { readonly [Key in PropertyKey]: unknown }

export type UnknownMap = ReadonlyMap<unknown, unknown>

export type UnknownArray = readonly unknown[]

export declare class OpaqueTag<S extends symbol> {
  private readonly tag: S
}

export enum CssParserNewLineContext {
  POSTS = -2,
  PREPS = -1,
  UNKWN = 0,
  PROPS = 1,
  BLCKS = 2,
  ATRUL = 3,
}

export type ShouldVendorPrefixCssDeclaration = (
  key: string,
  value: string,
  context: CssParserNewLineContext,
) => boolean

export type CssParserVendorPrefixOption =
  | boolean
  | ShouldVendorPrefixCssDeclaration

declare const StyleSheetIdTag: unique symbol
export type StyleSheetId = string & OpaqueTag<typeof StyleSheetIdTag>

declare const NestedCssTag: unique symbol
export type NestedCss = string & OpaqueTag<typeof NestedCssTag>

declare const CssRulesTag: unique symbol
export type CssRules = string & OpaqueTag<typeof CssRulesTag>

declare const ClassNameTag: unique symbol
export type ClassName = string & OpaqueTag<typeof ClassNameTag>

type IgnoredStyleElementAttributes = 'type' | 'id'
export type StyleElementAttributes = Readonly<Record<string, string>> &
  { readonly [key in IgnoredStyleElementAttributes]?: never }
