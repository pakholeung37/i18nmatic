import * as t from '@babel/types'
import traverse, { NodePath } from '@babel/traverse'
import { getTemplateLiteralKey } from '../common'
import { ExtractedText } from '../core/type'

export class Extractor {
  private results: ExtractedText[] = []

  constructor(
    private readonly ast: t.File,
    private readonly checkLanguage: (text: string) => boolean,
    private readonly filepath: string,
  ) {}

  public extract() {
    traverse(this.ast, {
      StringLiteral: (path) => this.handleStringLiteral(path),
      JSXText: (path) => this.handleJSXText(path),
      TemplateLiteral: (path) => this.handleTemplateLiteral(path),
    })

    const result = this.results
    this.results = []
    return result
  }

  private handleStringLiteral(path: NodePath<t.StringLiteral>) {
    const text = path.node.value
    if (!this.checkLanguage(text)) {
      return
    }

    const isTWrapped = this.checkTWrapper(path)
    const containerName = this.findContainerName(path)

    this.results.push({
      text,
      isTWrapped,
      containerName: this.filepath + '/' + (containerName || ''),
    })
  }

  private handleJSXText(path: NodePath<t.JSXText>) {
    const text = path.node.value.trim()
    if (!text || !this.checkLanguage(text)) {
      return
    }

    const isTWrapped = false // twrapper 후에는 JSXText로 인식되지 않음
    const containerName = this.findContainerName(path)

    this.results.push({
      text,
      isTWrapped,
      containerName: this.filepath + '/' + (containerName || ''),
    })
  }

  private handleTemplateLiteral(path: NodePath<t.TemplateLiteral>) {
    const { translationKey } = getTemplateLiteralKey(path)

    if (!this.checkLanguage(translationKey)) {
      return
    }

    const isTWrapped = this.checkTWrapper(path)
    const containerName = this.findContainerName(path)

    this.results.push({
      text: translationKey,
      isTWrapped,
      containerName: this.filepath + '/' + (containerName || ''),
    })
  }

  private checkTWrapper(path: NodePath): boolean {
    let current: NodePath | null = path

    while (current) {
      if (
        current.isCallExpression() &&
        t.isIdentifier(current.node.callee) &&
        current.node.callee.name === 't'
      ) {
        return true
      }

      current = current.parentPath
    }

    return false
  }

  private findContainerName(path: NodePath): string | null {
    const funcPath = this.findFunctionPath(path)

    if (funcPath) {
      // 함수 선언문인 경우
      if (t.isFunctionDeclaration(funcPath.node)) {
        return funcPath.node.id?.name || null
      }

      // 함수 표현식 혹은 화살표 함수인 경우
      if (
        t.isFunctionExpression(funcPath.node) ||
        t.isArrowFunctionExpression(funcPath.node)
      ) {
        if (funcPath.parentPath?.isVariableDeclarator()) {
          const declId = funcPath.parentPath.node.id
          if (t.isIdentifier(declId)) {
            return declId.name
          }
        }
      }

      return null
    }

    // 함수가 아니라면 변수 선언의 이름을 추출
    const varDeclPath = path.findParent((p) =>
      t.isVariableDeclarator(p.node),
    ) as NodePath<t.VariableDeclarator> | null
    if (varDeclPath) {
      const decId = varDeclPath.node.id
      if (t.isIdentifier(decId)) {
        return decId.name
      }
    }

    return null
  }

  private findFunctionPath(path: NodePath): NodePath | null {
    return path.findParent(
      (p) =>
        t.isFunctionDeclaration(p.node) ||
        t.isFunctionExpression(p.node) ||
        t.isArrowFunctionExpression(p.node),
    ) as NodePath<t.Function> | null
  }
}
