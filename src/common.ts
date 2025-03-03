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
