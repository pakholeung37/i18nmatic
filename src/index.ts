import { Loader } from "./loader";
import * as core from "./core";
import { createLanguageCheckFunction } from "./common";
import { Generator } from "./generator";

async function main() {
  const loader = new Loader();
  const generator = new Generator();

  // 추후 여러 언어 동적 할당
  loader.load((file) => {
    const transformAst = core.transform(
      file.ast,
      createLanguageCheckFunction("ko")
    );

    generator.generate(transformAst, file.filepath);

    // extractor
    // JSON
  });
}

main();
