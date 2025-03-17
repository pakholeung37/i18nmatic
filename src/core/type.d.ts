import * as t from "@babel/types";

export type PreHookContextNode =
  | t.FunctionDeclaration
  | t.FunctionExpression
  | t.ArrowFunctionExpression;

export type HookContextNode = PreHookContextNode;

export type RunType = "next" | "react";

export interface ExtractedText {
  text: string;
  isTWrapped: boolean;
  containerName: string;
}
