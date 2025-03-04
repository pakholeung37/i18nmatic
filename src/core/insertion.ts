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
}

// insertUseTranslationHook() {
//   // blockStatement로 감싸기
//   // 최상위 함수인지 판단
//   // t가 있는지(래핑이 되었는지 판단)
//   // 주입
// }
