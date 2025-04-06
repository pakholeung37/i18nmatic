import * as fs from "fs/promises";
import * as parser from "@babel/parser";
import * as t from "@babel/types";
import { globSync } from "fs";
import { handleParseError } from "../common";

interface File {
  ast: t.File;
  filepath: string;
}

export class Loader {
  private entry: string;

  constructor({ entry }: { entry: string }) {
    this.entry = entry;
  }

  load(
    callback: (file: File) => void,
    { onLoaded }: { onLoaded?: () => void }
  ) {
    const filePaths = this.getTargetFilePaths();

    const promises: Promise<void>[] = [];
    filePaths.forEach((filePath) => {
      promises.push(
        this.loadSourceFile(filePath)
          .then((file) => {
            // 파일에 전달받은 콜백 수행
            callback({ ast: file, filepath: filePath });
          })
          .catch((error: unknown) => {
            handleParseError(error, filePath);
          })
      );
    });

    Promise.all(promises).then(() => {
      onLoaded?.();
    });
    return promises;
  }

  private getTargetFilePaths(): string[] {
    return globSync(`${this.entry}/**/*.{js,jsx,ts,tsx}`);
  }

  private async loadSourceFile(filePath: string): Promise<t.File> {
    const code = await fs.readFile(filePath, "utf8");

    return parser.parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });
  }
}
