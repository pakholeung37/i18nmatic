import generate from "@babel/generator";
import * as t from "@babel/types";
import * as fs from "fs";
import * as prettier from "prettier";
import { ExtractedText } from "./core/type";
import * as path from "path";

export class Generator {
  private enablePrettier: boolean;
  constructor() {
    this.enablePrettier = true;
  }

  async generate(ast: t.File, filePath: string): Promise<void> {
    const code = this.generateCode(ast);

    const formattedCode = await this.formatCode(code);

    this.writeFile(formattedCode, filePath);
  }

  async generateJson(
    data: ExtractedText[],
    locales: string[],
    outputDir: string
  ): Promise<void> {
    const formattedData = this.formatExtractedText(data);
    const json = JSON.stringify(formattedData, null, 2).replace(
      /(\s+)"(__comment_\d+)"/g,
      '\n$1"$2"'
    );

    locales.forEach((locale) => {
      const filePath = `${outputDir}/${locale}/common.json`;
      this.writeFile(json, filePath);
    });
  }

  private generateCode(ast: t.File): string {
    return generate(ast, {
      jsescOption: { minimal: true },
    }).code;
  }

  private writeFile(content: string, filePath: string): void {
    const dir = path.dirname(filePath);

    // recursive: true 옵션으로 경로 전체에 대한 디렉토리 생성
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content);
  }

  private async formatCode(code: string): Promise<string> {
    if (!this.enablePrettier) {
      return code;
    }

    const config = (await prettier.resolveConfig(process.cwd())) || {};

    // format에 오류가 발생할 수 있음
    return await prettier.format(code, {
      ...config,
      parser: "babel-ts",
    });
  }

  private formatExtractedText(data: ExtractedText[]): Record<string, string> {
    // trwapper 분리

    const twrappedTexts = data.filter((item) => item.isTWrapped);

    // trwpper 아닌놈들은 containerName을 key로 그룹화
    const notTwrappedTexts = data.filter((item) => !item.isTWrapped);
    const groupedTexts = notTwrappedTexts.reduce<
      Record<string, ExtractedText[]>
    >((acc, item) => {
      if (!acc[item.containerName]) {
        acc[item.containerName] = [];
      }
      acc[item.containerName].push(item);
      return acc;
    }, {});

    // record 형태로 만들기

    return {
      ...this.plainJson(twrappedTexts),
      ...this.groupToPlainJson(groupedTexts),
    };
  }

  private plainJson(data: ExtractedText[]): Record<string, string> {
    const result: Record<string, string> = {};

    data.forEach((item) => {
      result[item.text] = item.text;
    });

    return result;
  }

  private groupToPlainJson(
    data: Record<string, ExtractedText[]>
  ): Record<string, string> {
    const result: Record<string, string> = {};

    Object.keys(data).forEach((key, index) => {
      result[`__comment_${index}`] = key;
      data[key].forEach((item) => {
        result[item.text] = item.text;
      });
    });
    return result;
  }
}
