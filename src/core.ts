import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { has } from "./common";
import generate from "@babel/generator";

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
          if (this.aleadlyWrappedStringLiteral(path)) {
            return;
          }

          if (this.checkLanguage(path.node.value)) {
            const newCallExpr = t.callExpression(t.identifier("t"), [
              t.stringLiteral(path.node.value),
            ]);

            if (t.isJSXAttribute(path.parent)) {
              path.parent.value = t.jsxExpressionContainer(newCallExpr);
            } else {
              path.replaceWith(newCallExpr);
            }
          }
        },
      });
    });
  }

  /**
   * 각 HookContextNode 내의 모든 JSXText 노드를 순회하여,
   * checkLanguage(text)가 true인 경우 t() 호출로 래핑한다.
   * JSXText는 JSXExpressionContainer 내부에 t() 호출로 감싸진 형태가 된다.
   */
  wrapJSXText(): void {
    this.paths.forEach((path) => {
      path.traverse({
        JSXText: (jsxTextPath: NodePath<t.JSXText>) => {
          if (this.alreadyWrappedJSX(jsxTextPath)) {
            return;
          }
          const text = jsxTextPath.node.value;
          // 필요에 따라 공백을 제거(여기서는 trim 후 빈 문자열이면 패스)
          const trimmed = text.trim();
          if (trimmed && this.checkLanguage(trimmed)) {
            const newCallExpr = t.callExpression(t.identifier("t"), [
              t.stringLiteral(trimmed),
            ]);
            const jsxExprContainer = t.jsxExpressionContainer(newCallExpr);
            jsxTextPath.replaceWith(jsxExprContainer);
          }
        },
      });
    });
  }

  wrapTemplateLiteral(): void {
    this.paths.forEach((path) => {
      path.traverse({
        TemplateLiteral: (tplPath: NodePath<t.TemplateLiteral>) => {
          const quasis = tplPath.node.quasis;
          const expressions = tplPath.node.expressions;
          let translationKey = "";
          const properties: t.ObjectProperty[] = [];

          for (let i = 0; i < expressions.length; i++) {
            translationKey += quasis[i].value.cooked;
            // expressions[i]가 TSType이 아닌 실행 표현식인 경우에만 처리
            if (!t.isTSType(expressions[i]) && t.isExpression(expressions[i])) {
              const exprCode = generate(expressions[i]).code;
              translationKey += `{{${exprCode}}}`;
              properties.push(
                t.objectProperty(
                  t.stringLiteral(exprCode),
                  expressions[i] as t.Expression
                )
              );
            } else {
              // TSType인 경우에는 플레이스홀더만 추가 (빈 플레이스홀더)
              translationKey += `{{}}`;
            }
          }
          // 마지막 고정 문자열 부분 추가
          translationKey += quasis[expressions.length].value.cooked;

          // 템플릿 리터럴 전체 텍스트(translationKey)에 한글이 포함되어 있는지 검사
          if (!this.checkLanguage(translationKey)) {
            // 한글이 없다면 변환하지 않고 그대로 둠
            return;
          }

          const objExpr = t.objectExpression(properties);
          const callExpr = t.callExpression(t.identifier("t"), [
            t.stringLiteral(translationKey),
            objExpr,
          ]);
          tplPath.replaceWith(callExpr);
        },
      });
    });
  }

  private aleadlyWrappedStringLiteral(path: NodePath): boolean {
    return (
      t.isCallExpression(path.parent) &&
      t.isIdentifier(path.parent.callee) &&
      path.parent.callee.name === "t"
    );
  }

  private alreadyWrappedJSX(path: NodePath): boolean {
    if (t.isJSXExpressionContainer(path.parent)) {
      const expr = path.parent.expression;
      if (
        t.isCallExpression(expr) &&
        t.isIdentifier(expr.callee) &&
        expr.callee.name === "t"
      ) {
        return true;
      }
    }
    return false;
  }
}
