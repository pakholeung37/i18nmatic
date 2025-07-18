import { findHookContextNode } from "./finder"
import { Insertion } from "./insertion"
import { TWrapper } from "./twrapper"
import * as t from "@babel/types"

export function transform(
  ast: t.File,
  checkLanguage: (text: string) => boolean,
  importModuleName: string = "react-i18next",
  useHook: boolean = false,
  aggressive: boolean = false,
): {
  ast: t.File
  isChanged: boolean
} {
  const hookContextNodes = findHookContextNode(ast, aggressive)

  const wrapper = new TWrapper(hookContextNodes, checkLanguage)

  const isWrappedChanged = wrapper.wrap()

  const insertion = new Insertion(
    hookContextNodes,
    ast,
    importModuleName,
    useHook,
    aggressive,
  )

  insertion.insert()

  return { ast, isChanged: isWrappedChanged }
}
