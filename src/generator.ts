import generate from "@babel/generator";
import * as t from "@babel/types";
import * as fs from "fs";
import * as prettier from "prettier";

export class Generator {
  private enablePrettier: boolean;
  constructor() {
    this.enablePrettier = true;
  }

  async generate(ast: t.File, filePath: string): Promise<void> {
    const code = this.generateCode(ast);

    const formattedCode = await this.formatCode(code);

    this.writeCode(formattedCode, filePath);
  }

  private generateCode(ast: t.File): string {
    return generate(ast, {
      jsescOption: { minimal: true },
    }).code;
  }

  private writeCode(code: string, filePath: string): void {
    fs.writeFileSync(filePath, code);
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
}
