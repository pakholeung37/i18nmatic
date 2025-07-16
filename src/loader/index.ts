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
  private glob: string | string[];
  private ext: string[];

  constructor({ 
    glob, 
    ext = ['js', 'jsx', 'ts', 'tsx'] 
  }: { 
    glob: string | string[]; 
    ext?: string[] 
  }) {
    this.glob = glob;
    this.ext = ext;
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
    const extPattern = `{${this.ext.join(',')}}`;
    const globPatterns = Array.isArray(this.glob) ? this.glob : [this.glob];
    
    const allPaths: string[] = [];
    
    for (const pattern of globPatterns) {
      // 如果 pattern 已经包含文件扩展名，直接使用
      if (pattern.includes('.')) {
        allPaths.push(...globSync(pattern));
      } else {
        // 如果 pattern 不包含扩展名，添加扩展名匹配
        if (pattern.includes('*') || pattern.includes('?') || pattern.includes('[')) {
          // 如果是 glob 模式，直接使用并添加扩展名
          allPaths.push(...globSync(`${pattern}.${extPattern}`));
          allPaths.push(...globSync(`${pattern}/**/*.${extPattern}`));
        } else {
          // 如果是目录路径，在目录下查找文件
          allPaths.push(...globSync(`${pattern}/**/*.${extPattern}`));
        }
      }
    }
    
    // 去重并返回
    return [...new Set(allPaths)];
  }

  private async loadSourceFile(filePath: string): Promise<t.File> {
    const code = await fs.readFile(filePath, "utf8");

    return parser.parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });
  }
}
