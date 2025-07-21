import { NodePath } from "@babel/traverse"
import * as t from "@babel/types"
import { HookContextNode } from "./type"
import { getTemplateLiteralKey } from "../common"

export class TWrapper {
  private hasChanges = false

  constructor(
    private readonly paths: NodePath<HookContextNode>[],
    private readonly checkLanguage: (text: string) => boolean,
  ) {}

  wrap(): boolean {
    this.hasChanges = false
    this.wrapStringLiteral()
    this.wrapJSXText()
    this.wrapTemplateLiteral()
    return this.hasChanges
  }

  /**
   * 각 HookContextNode 내의 모든 StringLiteral 노드를 순회하여,
   * checkLanguage(text)가 true인 경우 t() 호출로 래핑한다.
   */
  wrapStringLiteral(): void {
    this.paths.forEach((path) => {
      path.traverse({
        StringLiteral: (stringPath: NodePath<t.StringLiteral>) => {
          if (this.aleadlyWrappedStringLiteral(stringPath)) {
            return
          }

          // 如果当前路径是Program节点，需要过滤掉函数内部的字符串
          if (t.isProgram(path.node)) {
            // 检查字符串是否在函数内部
            if (this.isStringInFunction(stringPath)) {
              return
            }

            // 跳过import/export等不应该被转换的字符串
            if (this.shouldSkipStringLiteral(stringPath)) {
              return
            }
          }

          if (this.checkLanguage(stringPath.node.value)) {
            const newCallExpr = t.callExpression(t.identifier("t"), [
              t.stringLiteral(stringPath.node.value),
            ])

            if (t.isJSXAttribute(stringPath.parent)) {
              stringPath.parent.value = t.jsxExpressionContainer(newCallExpr)
            } else {
              stringPath.replaceWith(newCallExpr)
            }
            this.hasChanges = true
          }
        },
      })
    })
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
            return
          }

          // 如果当前路径是Program节点，需要过滤掉函数内部的JSXText
          if (t.isProgram(path.node)) {
            if (this.isJSXTextInFunction(jsxTextPath)) {
              return
            }
          }

          const text = jsxTextPath.node.value
          const trimmed = text.trim()
          if (trimmed && this.checkLanguage(trimmed)) {
            const newCallExpr = t.callExpression(t.identifier("t"), [
              t.stringLiteral(trimmed),
            ])
            const jsxExprContainer = t.jsxExpressionContainer(newCallExpr)
            jsxTextPath.replaceWith(jsxExprContainer)
            this.hasChanges = true
          }
        },
      })
    })
  }

  wrapTemplateLiteral(): void {
    this.paths.forEach((path) => {
      path.traverse({
        TemplateLiteral: (tplPath: NodePath<t.TemplateLiteral>) => {
          // 如果当前路径是Program节点，需要过滤掉函数内部的TemplateLiteral
          if (t.isProgram(path.node)) {
            if (this.isTemplateLiteralInFunction(tplPath)) {
              return
            }
          }

          const { translationKey, properties } = getTemplateLiteralKey(tplPath)

          // 템플릿 리터럴 전체 텍스트(translationKey)에 한글이 포함되어 있는지 검사
          if (!this.checkLanguage(translationKey)) {
            // 한글이 없다면 변환하지 않고 그대로 둠
            return
          }

          const objExpr = t.objectExpression(properties)
          const callExpr = t.callExpression(t.identifier("t"), [
            t.stringLiteral(translationKey),
            objExpr,
          ])

          tplPath.replaceWith(callExpr)
          this.hasChanges = true
        },
      })
    })
  }

  private aleadlyWrappedStringLiteral(path: NodePath): boolean {
    return (
      t.isCallExpression(path.parent) &&
      t.isIdentifier(path.parent.callee) &&
      path.parent.callee.name === "t"
    )
  }

  private alreadyWrappedJSX(path: NodePath): boolean {
    if (t.isJSXExpressionContainer(path.parent)) {
      const expr = path.parent.expression
      if (
        t.isCallExpression(expr) &&
        t.isIdentifier(expr.callee) &&
        expr.callee.name === "t"
      ) {
        return true
      }
    }
    return false
  }

  /**
   * 检查字符串是否在函数内部
   */
  private isStringInFunction(stringPath: NodePath<t.StringLiteral>): boolean {
    return !!stringPath.findParent((p) =>
      t.isFunctionDeclaration(p.node) ||
      t.isFunctionExpression(p.node) ||
      t.isArrowFunctionExpression(p.node)
    )
  }

  /**
   * 检查JSXText是否在函数内部
   */
  private isJSXTextInFunction(jsxTextPath: NodePath<t.JSXText>): boolean {
    return !!jsxTextPath.findParent((p) =>
      t.isFunctionDeclaration(p.node) ||
      t.isFunctionExpression(p.node) ||
      t.isArrowFunctionExpression(p.node)
    )
  }

  /**
   * 检查TemplateLiteral是否在函数内部
   */
  private isTemplateLiteralInFunction(tplPath: NodePath<t.TemplateLiteral>): boolean {
    return !!tplPath.findParent((p) =>
      t.isFunctionDeclaration(p.node) ||
      t.isFunctionExpression(p.node) ||
      t.isArrowFunctionExpression(p.node)
    )
  }

  /**
   * 判断是否应该跳过某些字符串字面量的转换
   */
  private shouldSkipStringLiteral(path: NodePath<t.StringLiteral>): boolean {
    // 跳过import声明中的字符串
    if (path.findParent((p) => t.isImportDeclaration(p.node))) {
      return true
    }

    // 跳过export声明中的模块标识符，但不跳过export的变量值
    const exportParent = path.findParent((p) => t.isExportNamedDeclaration(p.node) || t.isExportAllDeclaration(p.node))
    if (exportParent) {
      // 如果是 export { name } from "module" 这种形式，跳过 "module" 字符串
      if (t.isExportNamedDeclaration(exportParent.node) && exportParent.node.source === path.node) {
        return true
      }
      // 如果是 export * from "module" 这种形式，跳过 "module" 字符串
      if (t.isExportAllDeclaration(exportParent.node) && exportParent.node.source === path.node) {
        return true
      }
      // 对于 export const name = "value" 这种形式，不跳过 "value" 字符串
    }

    // 跳过require调用中的字符串
    if (path.findParent((p) =>
      t.isCallExpression(p.node) &&
      t.isIdentifier(p.node.callee) &&
      p.node.callee.name === "require"
    )) {
      return true
    }

    // 跳过对象的key（属性名）
    if (t.isObjectProperty(path.parent) && path.parent.key === path.node) {
      return true
    }

    // 跳过TypeScript类型注解，但不跳过类型断言中的值
    if (path.findParent((p) => t.isTSTypeAnnotation(p.node))) {
      return true
    }

    return false
  }
}
