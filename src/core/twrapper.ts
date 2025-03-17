import generate from "@babel/generator";
import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { HookContextNode } from "./type";
import { getTemplateLiteralKey } from "../common";

export class TWrapper {
  constructor(
    private readonly paths: NodePath<HookContextNode>[],
    private readonly checkLanguage: (text: string) => boolean
  ) {}

  wrap() {
    this.wrapStringLiteral();
    this.wrapJSXText();
    this.wrapTemplateLiteral();
  }

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
          const { translationKey, properties } = getTemplateLiteralKey(tplPath);

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
