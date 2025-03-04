import { findHookContextNode } from "./finder";
import { TWrapper } from "./twrapper";
import * as t from "@babel/types";

export function transform(
  ast: t.File,
  checkLanguage: (text: string) => boolean
) {
  const hookContextNodes = findHookContextNode(ast);

  const wrapper = new TWrapper(hookContextNodes, checkLanguage);
  // 변환
}
