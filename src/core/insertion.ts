import { NodePath } from "@babel/traverse";
import { HookContextNode } from "./type";
import * as t from "@babel/types";
export class Insertion {
  constructor(private readonly paths: NodePath<HookContextNode>[]) {}

  formatWithBlockStatement() {
    this.paths.forEach((path) => {
      // 훅을 주입할 수 있게, blockStatement로 감싸기
      if (t.isArrowFunctionExpression(path.node)) {
        // 만약 body가 BlockStatement가 아니라면, 암시적 반환이므로 변환
        if (!t.isBlockStatement(path.node.body)) {
          // 기존 expression을 명시적 반환문(return expression;)으로 감싼 BlockStatement 생성
          path.node.body = t.blockStatement([
            t.returnStatement(path.node.body),
          ]);
        }
      }
    });
  }

  insertUseTranslationHook() {
    // 최상위 함수인지 판단
    // t가 있는지(래핑이 되었는지 판단)
    // 주입
    this.paths.forEach((path) => {
      if (!this.isTopLevelFunction(path)) return;

      if (!this.hasTWrapper(path)) return;
      console.log("????");

      if (!t.isBlockStatement(path.node.body)) {
        throw new Error("only explicit return can insert hook");
      }
      if (this.isAlreadyInjectedHook(path)) return;

      // 주입할 훅: const { t } = useTranslation();
      const hookInjection = t.variableDeclaration("const", [
        t.variableDeclarator(
          t.objectPattern([
            t.objectProperty(t.identifier("t"), t.identifier("t"), false, true),
          ]),
          t.callExpression(t.identifier("useTranslation"), [])
        ),
      ]);
      // 함수의 첫 번째 문장으로 삽입
      const blockPath = path.get("body") as NodePath<t.BlockStatement>;
      blockPath.node.body.unshift(hookInjection);
    });
  }

  private isTopLevelFunction(path: NodePath<HookContextNode>): boolean {
    const parentFn = path.findParent(
      (p) =>
        t.isFunctionDeclaration(p.node) ||
        t.isFunctionExpression(p.node) ||
        t.isArrowFunctionExpression(p.node)
    );

    return !parentFn;
  }

  private hasTWrapper(path: NodePath<HookContextNode>): boolean {
    let hasTCall = false;
    path.traverse({
      CallExpression(callPath) {
        if (
          t.isIdentifier(callPath.node.callee) &&
          callPath.node.callee.name === "t"
        ) {
          hasTCall = true;
          callPath.stop();
        }
      },
    });

    return hasTCall;
  }

  private isAlreadyInjectedHook(path: NodePath<HookContextNode>): boolean {
    const blockPath = path.get("body") as NodePath<t.BlockStatement>;
    const firstStmt = blockPath.node.body[0];

    if (firstStmt && t.isVariableDeclaration(firstStmt)) {
      const decl = firstStmt.declarations[0];

      if (
        t.isVariableDeclarator(decl) &&
        t.isObjectPattern(decl.id) &&
        t.isCallExpression(decl.init) &&
        t.isIdentifier(decl.init.callee) &&
        decl.init.callee.name === "useTranslation"
      ) {
        return true;
      }
    }

    return false;
  }
}
