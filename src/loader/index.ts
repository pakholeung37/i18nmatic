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

  async load(
    callback: (file: File) => void,
    options?: { onLoaded?: () => void }
  ): Promise<void> {
    const { onLoaded } = options || {};
    const filePaths = this.getTargetFilePaths();

    try {
      const filePromises = filePaths.map(async (filePath) => {
        try {
          const file = await this.loadSourceFile(filePath);
          callback({ ast: file, filepath: filePath });
        } catch (error) {
          handleParseError(error, filePath);
        }
      });

      await Promise.all(filePromises);
      onLoaded?.();
    } catch (error) {
      console.error("Failed to load files:", error);
      throw error;
    }
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
