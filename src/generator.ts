import generate from "@babel/generator";
import * as t from "@babel/types";
import * as fs from "fs";

export class Generator {
  generate(ast: t.File, filePath: string): void {
    const code = this.generateCode(ast);
    this.writeCode(code, filePath);
  }

  private generateCode(ast: t.File): string {
    return generate(ast, {
      jsescOption: { minimal: true },
    }).code;
  }

  private writeCode(code: string, filePath: string): void {
    fs.writeFileSync(filePath, code);
  }
}
