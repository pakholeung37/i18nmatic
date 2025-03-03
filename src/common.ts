import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

export function has<T>(
  path: NodePath,
  check: (node: t.Node) => boolean
): boolean {
  let found = false;

  path.traverse({
    enter(p) {
      if (check(p.node)) {
        found = true;
        p.stop(); // 조건을 만족하는 노드를 찾으면 탐색 종료
      }
    },
  });

  return found;
}

type Language = "ko";

export function createLanguageCheckFunction(language: Language) {
  switch (language) {
    case "ko":
      return containsKorean;
    default:
      return () => false;
  }
}

function containsKorean(text: string): boolean {
  // [가-힣] 범위의 한글 문자를 찾는 정규식
  const koreanRegex = /[가-힣]/;
  return koreanRegex.test(text);
}
