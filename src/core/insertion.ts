import { NodePath } from "@babel/traverse";
import { HookContextNode } from "./type";

export class Insertion {
  constructor(private readonly path: NodePath<HookContextNode>) {}

  formatWithBlockStatement() {
    // 훅을 주입할 수 있게, blockStatement로 감싸기
  }

  insertUseTranslationHook() {
    // blockStatement로 감싸기
    // 최상위 함수인지 판단
    // t가 있는지(래핑이 되었는지 판단)
    // 주입
  }
}
