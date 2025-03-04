import { NodePath } from "@babel/traverse";
import { HookContextNode } from "./type";
import * as t from "@babel/types";
import { RunType } from "./type";
import { find, has } from "../common";

function getImportModuleName(runType: RunType) {
  switch (runType) {
    case "next":
      return "next-i18next";
    case "react":
      return "react-i18next";
    default:
      throw new Error("Run type is not specified");
  }
}

export class Insertion {
  private importModuleName: string;
  constructor(
    private readonly paths: NodePath<HookContextNode>[],
    private readonly parsedFileAST: t.File,
    runType: RunType = "next"
  ) {
    this.importModuleName = getImportModuleName(runType);
  }

  insertImportDeclartion() {
    // t.isProgram 찾기
    // 이미 import문이 있는지 검사
    // 파일 내부에 t가 있는지 검사 (hasTWrapper 함수 활용)
    // 있으면 삽입
    const programPath = find(this.parsedFileAST, t.isProgram);

    if (!programPath) {
      throw new Error("not validate file");
    }

    if (
      has(
        programPath,
        (node) =>
          t.isImportDeclaration(node) &&
          node.source.value === this.importModuleName
      )
    ) {
      return;
    }

    if (!this.hasTWrapper(programPath)) {
      return;
    }

    const importDeclaration = t.importDeclaration(
      [
        t.importSpecifier(
          t.identifier("useTranslation"),
          t.identifier("useTranslation")
        ),
      ],
      t.stringLiteral(this.importModuleName)
    );

    // Program 노드의 body 최상단에 import 선언 삽입
    programPath.unshiftContainer("body", importDeclaration);
  }

  private hasTWrapper(path: NodePath): boolean {
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
    this.paths.forEach((path) => {
      if (!this.isTopLevelFunction(path)) return;

      if (!this.hasTWrapper(path)) return;

      if (!t.isBlockStatement(path.node.body)) {
        throw new Error("only explicit return can insert hook");
      }
      if (this.isAlreadyInjectedHook(path)) return;

      const hookInjection = t.variableDeclaration("const", [
        t.variableDeclarator(
          t.objectPattern([
            t.objectProperty(t.identifier("t"), t.identifier("t"), false, true),
          ]),
          t.callExpression(t.identifier("useTranslation"), [])
        ),
      ]);

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
