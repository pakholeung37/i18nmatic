import * as t from "@babel/types";

export type PreHookContextNode =
  | t.FunctionDeclaration
  | t.FunctionExpression
  | t.ArrowFunctionExpression;

export type HookContextNode = PreHookContextNode;
