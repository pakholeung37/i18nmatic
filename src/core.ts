import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { has } from "./common";

export function transform(ast: t.Node) {}

export function findHookContextNode(node: t.Node) {
  const hookContextNodes: t.Function[] = [];

  traverse(node, {
    FunctionDeclaration(path) {
      if (isHookContextNode(path)) {
        hookContextNodes.push(path.node);
      }
    },
    ArrowFunctionExpression(path) {
      if (isHookContextNode(path)) {
        hookContextNodes.push(path.node);
      }
    },
    FunctionExpression(path) {
      if (isHookContextNode(path)) {
        hookContextNodes.push(path.node);
      }
    },
  });

  return hookContextNodes;
}

export function isHookContextNode(path: NodePath<t.Function>) {
  return isFunctionalComponent(path) || isHook(path);
}

export function isFunctionalComponent(path: NodePath<t.Function>): boolean {
  const functionName = getFunctionName(path);

  // 1. 함수 노드 자체에 id가 있는 경우 (FunctionDeclaration, 이름이 있는 FunctionExpression)

  if (!functionName) {
    return false;
  }

  // 대문자로 시작하는지 간단 체크
  if (!/^[A-Z]/.test(functionName)) {
    return false;
  }

  return has(path, (node) => t.isJSXElement(node) || t.isJSXFragment(node));
}

export function isHook(path: NodePath<t.Function>): boolean {
  const functionName = getFunctionName(path);

  if (!functionName) {
    return false;
  }

  return /^use[A-Z0-9]/.test(functionName);
}

function getFunctionName(path: NodePath<t.Function>) {
  let functionName: string | undefined;

  // 1. 함수 노드 자체에 id가 있는 경우 (FunctionDeclaration, 이름이 있는 FunctionExpression)
  if (
    (t.isFunctionDeclaration(path.node) || t.isFunctionExpression(path.node)) &&
    path.node.id
  ) {
    functionName = path.node.id.name;
  }

  // 2. 이름이 없으면 부모가 VariableDeclarator인지 확인 (익명 FunctionExpression, ArrowFunctionExpression)
  if (!functionName && path.parentPath.isVariableDeclarator()) {
    const id = path.parentPath.node.id;
    if (t.isIdentifier(id)) {
      functionName = id.name;
    }
  }

  return functionName;
}
