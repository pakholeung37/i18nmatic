import { NodePath } from '@babel/traverse'
import { HookContextNode } from './type'
import * as t from '@babel/types'
import { find, has } from '../common'

export class Insertion {
  private importModuleName: string
  constructor(
    private readonly paths: NodePath<HookContextNode>[],
    private readonly parsedFileAST: t.File,
    importFromName: string = 'react-i18next',
  ) {
    this.importModuleName = importFromName
  }

  insert() {
    try {
      this.wrapFunctionsWithBlockStatement()
      const isChanged = this.insertUseTranslationHook()
      this.insertImportDeclartion()

      return isChanged
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
      throw new Error('Invalid file: Program node not found')
    }

    if (!this.hasTCall(programPath)) {
      return
    }

    // 查找现有的 import 语句
    const existingImport = this.findExistingImport(programPath)

    if (existingImport) {
      // 如果已经存在该模块的 import，检查是否已经导入了 useTranslation
      if (!this.hasUseTranslationImport(existingImport)) {
        // 添加 useTranslation 到现有的 import 中
        this.addUseTranslationToExistingImport(existingImport)
      }
    } else {
      // 如果不存在该模块的 import，创建新的 import 语句
      const importDeclaration = t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier('useTranslation'),
            t.identifier('useTranslation'),
          ),
        ],
        t.stringLiteral(this.importModuleName),
      )

      // 找到第一个非 import 语句的位置
      const insertIndex = this.findInsertPosition(programPath)

      // 在指定位置插入 import 语句
      if (insertIndex === 0) {
        // 如果要插入到最前面，使用 unshiftContainer
        programPath.unshiftContainer('body', importDeclaration)
      } else {
        // 如果要插入到其他位置，使用 insertAfter
        const bodyPaths = programPath.get('body')
        if (Array.isArray(bodyPaths) && bodyPaths[insertIndex - 1]) {
          bodyPaths[insertIndex - 1].insertAfter(importDeclaration)
        } else {
          // 回退到使用 unshiftContainer
          programPath.unshiftContainer('body', importDeclaration)
        }
      }
    }
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

  private hasUseTranslationImport(
    importDeclaration: t.ImportDeclaration,
  ): boolean {
    return importDeclaration.specifiers.some(
      (spec) =>
        t.isImportSpecifier(spec) &&
        t.isIdentifier(spec.imported) &&
        spec.imported.name === 'useTranslation',
    )
  }

  private addUseTranslationToExistingImport(
    importDeclaration: t.ImportDeclaration,
  ): void {
    const useTranslationSpecifier = t.importSpecifier(
      t.identifier('useTranslation'),
      t.identifier('useTranslation'),
    )

    importDeclaration.specifiers.push(useTranslationSpecifier)
  }

  private findInsertPosition(programPath: NodePath<t.Program>): number {
    // 找到最后一个 import 语句的位置
    let lastImportIndex = -1

    for (let i = 0; i < programPath.node.body.length; i++) {
      const stmt = programPath.node.body[i]
      if (t.isImportDeclaration(stmt)) {
        lastImportIndex = i
      } else {
        // 遇到第一个非 import 语句就停止
        break
      }
    }

    // 如果找到了 import 语句，在最后一个 import 之后插入
    // 如果没有找到 import 语句，在文件开头插入
    return lastImportIndex >= 0 ? lastImportIndex + 1 : 0
  }

  wrapFunctionsWithBlockStatement() {
    this.paths.forEach((path) => {
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

      const hookInjection = t.variableDeclaration('const', [
        t.variableDeclarator(
          t.objectPattern([
            t.objectProperty(t.identifier('t'), t.identifier('t'), false, true),
          ]),
          t.callExpression(t.identifier('useTranslation'), []),
        ),
      ])

      const blockPath = path.get('body') as NodePath<t.BlockStatement>
      blockPath.node.body.unshift(hookInjection)
      isChanged = true
    })
    return isChanged
  }

  private shouldInsertTranslationHook(
    path: NodePath<HookContextNode>,
  ): boolean {
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
        node.callee.name === 't',
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
    const blockPath = path.get('body') as NodePath<t.BlockStatement>
    const firstStmt = blockPath.node.body[0]

    return (
      t.isVariableDeclaration(firstStmt) &&
      t.isVariableDeclarator(firstStmt.declarations[0]) &&
      t.isObjectPattern(firstStmt.declarations[0].id) &&
      t.isCallExpression(firstStmt.declarations[0].init) &&
      t.isIdentifier(firstStmt.declarations[0].init.callee) &&
      firstStmt.declarations[0].init.callee.name === 'useTranslation'
    )
  }
}
