import { Loader } from "./loader";
import * as core from "./core";
import { createLanguageCheckFunction } from "./common";

async function main() {
  const loader = new Loader();

  // 추후 여러 언어 동적 할당
  loader.load((file) => {
    console.log(file);
    core.transform(file.ast, createLanguageCheckFunction("ko"));
  });
}

main();
