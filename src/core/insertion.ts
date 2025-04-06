import { NodePath } from "@babel/traverse";
import { HookContextNode } from "./type";
import * as t from "@babel/types";
import { find, has } from "../common";
import { RunType } from "../type";

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

  insert() {
    try {
      this.wrapFunctionsWithBlockStatement();
      const isChanged = this.insertUseTranslationHook();
      this.insertImportDeclartion();

      return isChanged;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to insert translations: ${error.message}`);
      }
      // 일반 객체나 다른 타입의 에러인 경우
      throw new Error(`Failed to insert translations: ${String(error)}`);
    }
  }

  insertImportDeclartion() {
    const programPath = find(this.parsedFileAST, t.isProgram);

    if (!programPath) {
      throw new Error("Invalid file: Program node not found");
    }

    if (!this.shouldInsertImportDeclaration(programPath)) {
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

  private shouldInsertImportDeclaration(
    programPath: NodePath<t.Program>
  ): boolean {
    return (
      !has(
        programPath,
        (node) =>
          t.isImportDeclaration(node) &&
          node.source.value === this.importModuleName
      ) && this.hasTCall(programPath)
    );
  }

  wrapFunctionsWithBlockStatement() {
    this.paths.forEach((path) => {
      if (
        t.isArrowFunctionExpression(path.node) &&
        !t.isBlockStatement(path.node.body)
      ) {
        path.node.body = t.blockStatement([t.returnStatement(path.node.body)]);
      }
    });
  }

  insertUseTranslationHook() {
    let isChanged = false;
    this.paths.forEach((path) => {
      if (!this.shouldInsertTranslationHook(path)) return;

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
      isChanged = true;
    });
    return isChanged;
  }

  private shouldInsertTranslationHook(
    path: NodePath<HookContextNode>
  ): boolean {
    return (
      this.isTopLevelFunction(path) &&
      this.hasTCall(path) &&
      t.isBlockStatement(path.node.body) &&
      !this.isAlreadyInjectedHook(path)
    );
  }

  private hasTCall(path: NodePath): boolean {
    return has(
      path,
      (node) =>
        t.isCallExpression(node) &&
        t.isIdentifier(node.callee) &&
        node.callee.name === "t"
    );
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

    return (
      t.isVariableDeclaration(firstStmt) &&
      t.isVariableDeclarator(firstStmt.declarations[0]) &&
      t.isObjectPattern(firstStmt.declarations[0].id) &&
      t.isCallExpression(firstStmt.declarations[0].init) &&
      t.isIdentifier(firstStmt.declarations[0].init.callee) &&
      firstStmt.declarations[0].init.callee.name === "useTranslation"
    );
  }
}
