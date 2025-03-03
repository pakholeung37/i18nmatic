import * as loader from "./loader";
import * as core from "./core";
import { createLanguageCheckFunction } from "./common";

function main() {
  const ast = loader.load();

  // 추후 여러 언어 동적 할당
  core.transform(ast, createLanguageCheckFunction("ko"));
}

main();
