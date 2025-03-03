import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { has } from "./common";

export function transform(
  ast: t.Node,
  checkLanguage: (text: string) => boolean
) {
  const hookContextNodes = findHookContextNode(ast);

  const wrapper = new TWrapper(hookContextNodes, checkLanguage);
  // 변환
}

type PreHookContextNode =
  | t.FunctionDeclaration
  | t.FunctionExpression
  | t.ArrowFunctionExpression;

type HookContextNode = PreHookContextNode;

export function findHookContextNode(node: t.Node): NodePath<HookContextNode>[] {
  const hookContextNodes: NodePath<HookContextNode>[] = [];

  traverse(node, {
    FunctionDeclaration(path) {
      if (isHookContextNode(path)) {
        hookContextNodes.push(path);
      }
    },
    ArrowFunctionExpression(path) {
      if (isHookContextNode(path)) {
        hookContextNodes.push(path);
      }
    },
    FunctionExpression(path) {
      if (isHookContextNode(path)) {
        hookContextNodes.push(path);
      }
    },
  });

  return hookContextNodes;
}

export function isHookContextNode(
  path: NodePath<PreHookContextNode>
): path is NodePath<HookContextNode> {
  return isFunctionalComponent(path) || isHook(path);
}

export function isFunctionalComponent(
  path: NodePath<PreHookContextNode>
): boolean {
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

export function isHook(path: NodePath<PreHookContextNode>): boolean {
  const functionName = getFunctionName(path);

  if (!functionName) {
    return false;
  }

  return /^use[A-Z0-9]/.test(functionName);
}

function getFunctionName(path: NodePath<PreHookContextNode>) {
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

export class TWrapper {
  constructor(
    private readonly paths: NodePath<HookContextNode>[],
    private readonly checkLanguage: (text: string) => boolean
  ) {}

  /**
   * 각 HookContextNode 내의 모든 StringLiteral 노드를 순회하여,
   * checkLanguage(text)가 true인 경우 t() 호출로 래핑한다.
   */
  wrapStringLiteral(): void {
    this.paths.forEach((path) => {
      path.traverse({
        StringLiteral: (path: NodePath<t.StringLiteral>) => {
          if (this.aleadlyWrapped(path)) {
            return;
          }

          if (this.checkLanguage(path.node.value)) {
            const newCallExpr = t.callExpression(t.identifier("t"), [
              t.stringLiteral(path.node.value),
            ]);
            path.replaceWith(newCallExpr);
          }
        },
      });
    });
  }

  private aleadlyWrapped(path: NodePath): boolean {
    return (
      t.isCallExpression(path.parent) &&
      t.isIdentifier(path.parent.callee) &&
      path.parent.callee.name === "t"
    );
  }
}
