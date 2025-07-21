import * as fs from "fs/promises"
import * as parser from "@babel/parser"
import * as t from "@babel/types"
import { globSync } from "glob"
import { handleParseError } from "../common"

interface File {
  ast: t.File
  filepath: string
}

export class Loader {
  private include: string | string[]
  private exclude: string | string[]
  private ext: string[]

  constructor({
    include,
    exclude = [],
    ext = ["js", "jsx", "ts", "tsx"],
  }: {
    include: string | string[]
    exclude?: string | string[]
    ext?: string[]
  }) {
    this.include = include
    this.exclude = exclude
    this.ext = ext
  }

  async load(
    callback: (file: File) => void,
    options?: { onLoaded?: () => void },
  ): Promise<void> {
    const { onLoaded } = options || {}
    const filePaths = this.getTargetFilePaths()

    try {
      const filePromises = filePaths.map(async (filePath) => {
        try {
          const file = await this.loadSourceFile(filePath)
          callback({ ast: file, filepath: filePath })
        } catch (error) {
          handleParseError(error, filePath)
        }
      })

      await Promise.all(filePromises)
      onLoaded?.()
    } catch (error) {
      console.error("Failed to load files:", error)
      throw error
    }
  }

  private getTargetFilePaths(): string[] {
    const extPattern = `{${this.ext.join(",")}}`
    const includePatterns = Array.isArray(this.include)
      ? this.include
      : [this.include]
    const excludePatterns = Array.isArray(this.exclude)
      ? this.exclude
      : [this.exclude]

    const allPaths: string[] = []

    for (const pattern of includePatterns) {
      // 检查 pattern 是否已经包含文件扩展名（以支持的扩展名结尾）
      const hasFileExtension = this.ext.some(
        (ext) => pattern.endsWith(`.${ext}`) || pattern.includes(`*.${ext}`),
      )

      if (hasFileExtension) {
        // 如果已经包含文件扩展名，直接使用
        allPaths.push(...globSync(pattern))
      } else {
        // 如果 pattern 不包含扩展名，添加扩展名匹配
        if (
          pattern.includes("*") ||
          pattern.includes("?") ||
          pattern.includes("[")
        ) {
          // 如果是 glob 模式，直接使用并添加扩展名
          allPaths.push(...globSync(`${pattern}.${extPattern}`))
          allPaths.push(...globSync(`${pattern}/**/*.${extPattern}`))
        } else {
          // 如果是目录路径，在目录下查找文件
          allPaths.push(...globSync(`${pattern}/**/*.${extPattern}`))
        }
      }
    }
    let result = [...new Set(allPaths)]
    let realExcludedCount = 0
    // 应用排除模式
    if (excludePatterns.length > 0 && excludePatterns[0] !== "") {
      const excludedPaths = new Set<string>()
      for (const excludePattern of excludePatterns) {
        if (excludePattern) {
          const excluded = globSync(excludePattern)
          excluded.forEach((path) => excludedPaths.add(path))
        }
      }

      // 过滤掉被排除的文件
      result = result.filter((path) => {
        // Check if the path itself is excluded
        if (excludedPaths.has(path)) {
          realExcludedCount++
          return false
        }

        // Check if any parent directory of the path matches excluded patterns
        for (const excludePattern of excludePatterns) {
          if (excludePattern && path.startsWith(excludePattern)) {
            excludedPaths.add(path)
            realExcludedCount
            return false
          }
        }

        return true
      })
    }
    console.log(
      `Found ${result.length} files (${realExcludedCount} excluded) matching patterns: ${includePatterns.join(", ")}; excluding: ${excludePatterns.join(", ")}`,
    )

    // 去重并返回
    return result
  }

  private async loadSourceFile(filePath: string): Promise<t.File> {
    const code = await fs.readFile(filePath, "utf8")

    return parser.parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    })
  }
}
