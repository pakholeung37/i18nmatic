import { Loader } from "./loader";
import * as core from "./core";
import { createLanguageCheckFunction } from "./common";
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
            createLanguageCheckFunction("ko")
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

function handleParseError(error: unknown, filePath: string) {
  console.error(`❌ 파싱 오류 발생: ${filePath}`);

  // Babel 파싱 에러 구조
  // error.loc?.line, error.loc?.column, error.message
  if (error && typeof error === "object") {
    const e = error as any;
    if (e.loc) {
      console.error(
        `  위치: line ${e.loc.line}, column ${e.loc.column} - ${e.message}`
      );
    } else {
      console.error(`  메시지: ${e.message || e}`);
    }
  } else {
    console.error(`  메시지: ${String(error)}`);
  }
}
