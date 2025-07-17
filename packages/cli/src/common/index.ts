import generate from '@babel/generator'
import traverse, { NodePath } from '@babel/traverse'
import * as t from '@babel/types'

export function has(path: NodePath, check: (node: t.Node) => boolean): boolean {
  let found = false

  path.traverse({
    enter(p) {
      if (check(p.node)) {
        found = true
        p.stop() // 조건을 만족하는 노드를 찾으면 탐색 종료
      }
    },
  })

  return found
}

export function find<T extends t.Node>(
  node: t.Node,
  check: (node: t.Node) => node is T,
): NodePath<T> | null {
  let findPath: NodePath<T> | null = null

  traverse(node, {
    enter(p) {
      if (check(p.node)) {
        findPath = p as NodePath<T>
        p.stop()
      }
    },
  })

  return findPath
}

export function getTemplateLiteralKey(tplPath: NodePath<t.TemplateLiteral>) {
  const quasis = tplPath.node.quasis
  const expressions = tplPath.node.expressions
  let translationKey = ''
  const properties: t.ObjectProperty[] = []

  for (let i = 0; i < expressions.length; i++) {
    translationKey += quasis[i].value.cooked
    // expressions[i]가 TSType이 아닌 실행 표현식인 경우에만 처리

    let expr = expressions[i]

    if (t.isTSAsExpression(expr)) {
      // 재귀 함수로 'as' 중첩 제거
      expr = unwrapTSAsExpression(expr)
    }

    if (t.isExpression(expr)) {
      const exprCode = generate(expr).code
      translationKey += `{{${exprCode}}}`
      properties.push(
        t.objectProperty(t.stringLiteral(exprCode), expr as t.Expression),
      )
    } else {
      // TSType인 경우에는 플레이스홀더만 추가 (빈 플레이스홀더)
      translationKey += `{{}}`
    }
  }
  // 마지막 고정 문자열 부분 추가
  translationKey += quasis[expressions.length].value.cooked

  return { translationKey, properties }
}

function unwrapTSAsExpression(node: t.Expression): t.Expression {
  // 만약 node가 TSAsExpression이면, 그 내부 realExpr를 반환
  if (t.isTSAsExpression(node)) {
    return unwrapTSAsExpression(node.expression)
  }
  return node
}
export function handleParseError(error: unknown, filePath: string) {
  console.error(`❌ 파싱 오류 발생: ${filePath}`)

  // Babel 파싱 에러 구조
  // error.loc?.line, error.loc?.column, error.message
  if (error && typeof error === 'object') {
    const e = error as any
    if (e.loc) {
      console.error(
        `  위치: line ${e.loc.line}, column ${e.loc.column} - ${e.message}`,
      )
    } else {
      console.error(`  메시지: ${e.message || e}`)
    }
  } else {
    console.error(`  메시지: ${String(error)}`)
  }
}
