import { NodePath } from "@babel/traverse"
import { HookContextNode } from "./type"
import * as t from "@babel/types"
import { find, has } from "../common"
import { isFunctionalComponent, isHook } from "./finder"

export class Insertion {
  constructor(
    private readonly paths: NodePath<HookContextNode>[],
    private readonly parsedFileAST: t.File,
    private importModuleName: string = "react-i18next",
    private useHook: boolean = false,
    private aggressive: boolean = false,
  ) {}

  insert() {
    try {
      this.wrapFunctionsWithBlockStatement()

      // 如果useHook为true，需要插入useTranslation hook
      // 在激进模式下，只在React组件和Hook中插入
      this.insertUseTranslationHook()

      this.insertImportDeclartion()
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to insert translations: ${error.message}`)
      }
      // 일반 객체나 다른 타입의 에러인 경우
      throw new Error(`Failed to insert translations: ${String(error)}`)
    }
  }

  insertImportDeclartion() {
    const programPath = find(this.parsedFileAST, t.isProgram)

    if (!programPath) {
      throw new Error("Invalid file: Program node not found")
    }

    // 检查是否需要导入
    const [needsT, needsUseTranslation] = this.analyzeImportNeeds()

    if (!needsT && !needsUseTranslation) {
      return
    }

    // 查找现有的 import 语句
    const existingImport = this.findExistingImport(programPath)

    if (existingImport) {
      // 根据需要添加导入
      if (
        needsUseTranslation &&
        !this.hasIdentifierImport(existingImport, "useTranslation")
      ) {
        this.addIdentifierToExistingImport(existingImport, "useTranslation")
      }
      if (needsT && !this.hasIdentifierImport(existingImport, "t")) {
        this.addIdentifierToExistingImport(existingImport, "t")
      }
    } else {
      // 创建新的 import 语句
      const specifiers: t.ImportSpecifier[] = []

      if (needsUseTranslation) {
        specifiers.push(
          t.importSpecifier(
            t.identifier("useTranslation"),
            t.identifier("useTranslation"),
          ),
        )
      }

      if (needsT) {
        specifiers.push(t.importSpecifier(t.identifier("t"), t.identifier("t")))
      }

      if (specifiers.length > 0) {
        const importDeclaration = t.importDeclaration(
          specifiers,
          t.stringLiteral(this.importModuleName),
        )
        this.insertImportAtPosition(programPath, importDeclaration)
      }
    }
  }

  /**
   * 分析需要导入什么
   */
  private analyzeImportNeeds(): [boolean, boolean] {
    let needsT = false
    let needsUseTranslation = false

    if (this.aggressive && this.useHook) {
      // 激进模式 + useHook模式：精确分析

      // 检查React组件和Hook是否需要useTranslation
      const reactComponentsAndHooks = this.paths.filter(
        (path) => !t.isProgram(path.node) && this.isReactComponentOrHook(path),
      )
      needsUseTranslation = reactComponentsAndHooks.some((path) =>
        this.hasTCall(path),
      )

      // 检查非组件/Hook以及全局作用域是否需要t
      const nonReactFunctions = this.paths.filter(
        (path) => !t.isProgram(path.node) && !this.isReactComponentOrHook(path),
      )
      const programPaths = this.paths.filter((path) => t.isProgram(path.node))

      // 检查非React函数中的t()调用
      const nonReactFunctionsNeedT = nonReactFunctions.some((path) =>
        this.hasTCall(path),
      )

      // 检查全局作用域中的t()调用（排除函数内部的调用）
      const globalScopeNeedT = programPaths.some((path) =>
        this.hasGlobalTCall(path),
      )

      needsT = nonReactFunctionsNeedT || globalScopeNeedT
    } else if (this.aggressive) {
      // 只有激进模式：只需要t
      needsT = this.paths.some((path) => this.hasTCall(path))
    } else if (this.useHook) {
      // 只有useHook模式：只需要useTranslation
      needsUseTranslation = this.paths.some((path) => this.hasTCall(path))
    } else {
      // 普通模式：只需要t
      needsT = this.paths.some((path) => this.hasTCall(path))
    }

    return [needsT, needsUseTranslation]
  }
  private findExistingImport(
    programPath: NodePath<t.Program>,
  ): t.ImportDeclaration | null {
    for (const stmt of programPath.node.body) {
      if (
        t.isImportDeclaration(stmt) &&
        stmt.source.value === this.importModuleName
      ) {
        return stmt
      }
    }
    return null
  }

  private insertImportAtPosition(
    programPath: NodePath<t.Program>,
    importDeclaration: t.ImportDeclaration,
  ): void {
    // 找到第一个非 import 语句的位置
    const insertIndex = this.findInsertPosition(programPath)

    // 在指定位置插入 import 语句
    if (insertIndex === 0) {
      // 如果要插入到最前面，使用 unshiftContainer
      programPath.unshiftContainer("body", importDeclaration)
    } else {
      // 如果要插入到其他位置，使用 insertAfter
      const bodyPaths = programPath.get("body")
      if (Array.isArray(bodyPaths) && bodyPaths[insertIndex - 1]) {
        bodyPaths[insertIndex - 1].insertAfter(importDeclaration)
      } else {
        // 回退到使用 unshiftContainer
        programPath.unshiftContainer("body", importDeclaration)
      }
    }
  }

  private hasIdentifierImport(
    importDeclaration: t.ImportDeclaration,
    identifier: string,
  ): boolean {
    return importDeclaration.specifiers.some(
      (spec) =>
        t.isImportSpecifier(spec) &&
        t.isIdentifier(spec.imported) &&
        spec.imported.name === identifier,
    )
  }

  private addIdentifierToExistingImport(
    importDeclaration: t.ImportDeclaration,
    identifier: string,
  ): void {
    const useTranslationSpecifier = t.importSpecifier(
      t.identifier(identifier),
      t.identifier(identifier),
    )

    importDeclaration.specifiers.push(useTranslationSpecifier)
  }

  private findInsertPosition(programPath: NodePath<t.Program>): number {
    // 找到第一个 import 语句的位置，新的 import 将插入到所有现有 import 的前面
    for (let i = 0; i < programPath.node.body.length; i++) {
      const stmt = programPath.node.body[i]
      if (t.isImportDeclaration(stmt)) {
        return i // 返回第一个 import 语句的位置
      }
    }

    // 如果没有找到 import 语句，在文件开头插入
    return 0
  }

  wrapFunctionsWithBlockStatement() {
    this.paths.forEach((path) => {
      // 跳过Program节点
      if (t.isProgram(path.node)) {
        return
      }

      if (
        t.isArrowFunctionExpression(path.node) &&
        !t.isBlockStatement(path.node.body)
      ) {
        path.node.body = t.blockStatement([t.returnStatement(path.node.body)])
      }
    })
  }

  insertUseTranslationHook() {
    let isChanged = false
    this.paths.forEach((path) => {
      if (!this.shouldInsertTranslationHook(path)) return

      const hookInjection = t.variableDeclaration("const", [
        t.variableDeclarator(
          t.objectPattern([
            t.objectProperty(t.identifier("t"), t.identifier("t"), false, true),
          ]),
          t.callExpression(t.identifier("useTranslation"), []),
        ),
      ])

      const blockPath = path.get("body") as NodePath<t.BlockStatement>
      blockPath.node.body.unshift(hookInjection)
      isChanged = true
    })
    return isChanged
  }

  private shouldInsertTranslationHook(
    path: NodePath<HookContextNode>,
  ): boolean {
    // Program节点不需要插入useTranslation hook
    if (t.isProgram(path.node)) {
      return false
    }

    // 检查是否是React组件或Hook
    if (!this.isReactComponentOrHook(path)) {
      return false
    }

    return (
      this.isTopLevelFunction(path) &&
      this.hasTCall(path) &&
      t.isBlockStatement(path.node.body) &&
      !this.isAlreadyInjectedHook(path)
    )
  }

  private hasTCall(path: NodePath): boolean {
    return has(
      path,
      (node) =>
        t.isCallExpression(node) &&
        t.isIdentifier(node.callee) &&
        node.callee.name === "t",
    )
  }

  private isTopLevelFunction(path: NodePath<HookContextNode>): boolean {
    const parentFn = path.findParent(
      (p) =>
        t.isFunctionDeclaration(p.node) ||
        t.isFunctionExpression(p.node) ||
        t.isArrowFunctionExpression(p.node),
    )

    return !parentFn
  }

  private isAlreadyInjectedHook(path: NodePath<HookContextNode>): boolean {
    // Program节点不会有useTranslation hook
    if (t.isProgram(path.node)) {
      return false
    }

    const blockPath = path.get("body") as NodePath<t.BlockStatement>
    const firstStmt = blockPath.node.body[0]

    return (
      t.isVariableDeclaration(firstStmt) &&
      t.isVariableDeclarator(firstStmt.declarations[0]) &&
      t.isObjectPattern(firstStmt.declarations[0].id) &&
      t.isCallExpression(firstStmt.declarations[0].init) &&
      t.isIdentifier(firstStmt.declarations[0].init.callee) &&
      firstStmt.declarations[0].init.callee.name === "useTranslation"
    )
  }

  /**
   * 检查函数是否是React组件或Hook
   */
  private isReactComponentOrHook(path: NodePath<HookContextNode>): boolean {
    // Program节点不是React组件或Hook
    if (t.isProgram(path.node)) {
      return false
    }

    return isFunctionalComponent(path) || isHook(path)
  }

  /**
   * 检查全局作用域中是否有t()调用（不包括函数内部的调用）
   */
  private hasGlobalTCall(path: NodePath): boolean {
    let found = false

    path.traverse({
      enter(p) {
        // 如果遇到函数，跳过其内部
        if (
          t.isFunctionDeclaration(p.node) ||
          t.isFunctionExpression(p.node) ||
          t.isArrowFunctionExpression(p.node)
        ) {
          p.skip() // 跳过函数内部
          return
        }

        // 检查是否是t()调用
        if (
          t.isCallExpression(p.node) &&
          t.isIdentifier(p.node.callee) &&
          p.node.callee.name === "t"
        ) {
          found = true
          p.stop()
        }
      },
    })

    return found
  }
}
