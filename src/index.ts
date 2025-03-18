import { Loader } from "./loader";
import * as core from "./core";
import { createLanguageCheckFunction } from "./common";
import { Generator } from "./generator";
import { Extractor } from "./extractor";
import { ExtractedText } from "./core/type";

export async function main() {
  const loader = new Loader();
  const generator = new Generator();
  const extractedTexts: ExtractedText[] = [];

  // 추후 여러 언어 동적 할당
  loader.load(
    (file) => {
      const transformAst = core.transform(
        file.ast,
        createLanguageCheckFunction("ko")
      );

      generator.generate(transformAst, file.filepath);

      extractedTexts.push(
        ...new Extractor(file.ast, createLanguageCheckFunction("ko")).extract()
      );
    },
    {
      onLoaded: () => {
        generator.generateJson(
          extractedTexts,
          loader.options.locales,
          loader.options.outputDir
        );
      },
    }
  );
}
