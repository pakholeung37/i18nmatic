import { Loader } from "./loader";
import * as core from "./core";
import { createLanguageCheckFunction, handleParseError } from "./common";
import { Generator } from "./generator";
import { Extractor } from "./extractor";
import { ExtractedText } from "./core/type";

interface Options {
  runOn: "next";
  locales: string[];
  defaultLocale: string;
  outputDir: string;
  entry: string;
  enablePrettier: boolean;
}

export async function main(options: Options) {
  const loader = new Loader({
    entry: options.entry,
  });

  const generator = new Generator({
    enablePrettier: options.enablePrettier,
  });
  const extractedTexts: ExtractedText[] = [];

  // 추후 여러 언어 동적 할당
  loader.load(
    (file) => {
      try {
        const { ast: transformAst, isChanged } = core.transform(
          file.ast,
          createLanguageCheckFunction("ko")
        );

        if (isChanged) {
          generator.generate(transformAst, file.filepath);
        }

        extractedTexts.push(
          ...new Extractor(
            file.ast,
            createLanguageCheckFunction("ko"),
            file.filepath
          ).extract()
        );
      } catch (error) {
        handleParseError(error, file.filepath);
      }
    },
    {
      onLoaded: () => {
        generator.generateJson(
          extractedTexts,
          options.locales,
          options.outputDir
        );
      },
    }
  );
}
