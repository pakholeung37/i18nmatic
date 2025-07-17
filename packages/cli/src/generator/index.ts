import generate from "@babel/generator"
import * as t from "@babel/types"
import * as fs from "fs"
import * as prettier from "prettier"
import * as path from "path"
import { ExtractedText } from "../core/type"
import { OutputTranslation } from "../type"

export class Generator {
  private enablePrettier: boolean
  private dry: boolean | undefined
  constructor({
    enablePrettier,
    dry,
  }: {
    enablePrettier: boolean
    dry?: boolean
  }) {
    this.enablePrettier = enablePrettier
    this.dry = dry
  }

  async generate(ast: t.File, filePath: string): Promise<void> {
    const code = this.generateCode(ast)

    const formattedCode = await this.formatCode(code)

    this.writeFile(formattedCode, filePath)
  }

  async generateJson(
    data: ExtractedText[],
    locales: string[],
    outputDir: string,
    outputFileName: string,
    outputTranslation: OutputTranslation,
    comment: boolean = false,
    defaultTranslation: string = "",
  ): Promise<void> {
    const formattedData = this.formatExtractedText(
      data,
      comment,
      defaultTranslation,
    )

    locales.forEach((locale) => {
      const filePath = `${outputDir}/${locale}/${outputFileName}`

      let finalData = formattedData

      if (outputTranslation === "merge") {
        // merge 模式：读取现有文件并合并
        finalData = this.mergeWithExistingJson(filePath, formattedData)
      }

      if (outputTranslation !== "dry") {
        // 只有在非 dry 模式下才写入文件
        const json = JSON.stringify(finalData, null, 2).replace(
          /(\s+)"(__comment_\d+)"/g,
          '\n$1"$2"',
        )
        this.writeFile(json, filePath)
      }
    })
  }

  private generateCode(ast: t.File): string {
    return generate(ast, {
      jsescOption: { minimal: true },
    }).code
  }

  private writeFile(content: string, filePath: string): void {
    const dir = path.dirname(filePath)

    // recursive: true 옵션으로 경로 전체에 대한 디렉토리 생성
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!this.dry) {
      // 如果是 dry 模式 不输出
      fs.writeFileSync(filePath, content)
    } else {
      fs.writeFileSync(filePath + ".snap", content)
    }
  }

  private async formatCode(code: string): Promise<string> {
    if (!this.enablePrettier) {
      return code
    }

    const configPath = await prettier.resolveConfigFile()
    if (!configPath) {
      console.log("Prettier config file not found")
      return await prettier.format(code, {
        parser: "babel-ts",
      })
    }

    const config =
      (await prettier.resolveConfig(process.cwd(), {
        editorconfig: true,
        config: configPath,
      })) || {}

    // format에 오류가 발생할 수 있음
    return await prettier.format(code, {
      ...config,
      parser: "babel-ts",
    })
  }

  private formatExtractedText(
    data: ExtractedText[],
    comment: boolean = false,
    defaultTranslation: string = "",
  ): Record<string, string> {
    // trwapper 분리

    const twrappedTexts = data.filter((item) => item.isTWrapped)

    // trwpper 아닌놈들은 containerName을 key로 그룹화
    const notTwrappedTexts = data.filter((item) => !item.isTWrapped)
    const groupedTexts = notTwrappedTexts.reduce<
      Record<string, ExtractedText[]>
    >((acc, item) => {
      if (!acc[item.containerName]) {
        acc[item.containerName] = []
      }
      acc[item.containerName].push(item)
      return acc
    }, {})

    // record 형태로 만들기

    return {
      ...this.plainJson(twrappedTexts, defaultTranslation),
      ...this.groupToPlainJson(groupedTexts, comment, defaultTranslation),
    }
  }

  private plainJson(
    data: ExtractedText[],
    defaultTranslation: string = "",
  ): Record<string, string> {
    const result: Record<string, string> = {}

    data.forEach((item) => {
      result[item.text] = defaultTranslation
    })

    return result
  }

  private groupToPlainJson(
    data: Record<string, ExtractedText[]>,
    comment: boolean = false,
    defaultTranslation: string = "",
  ): Record<string, string> {
    const result: Record<string, string> = {}

    Object.keys(data).forEach((key, index) => {
      if (comment) {
        result[`__comment_${index}`] = key
      }
      data[key].forEach((item) => {
        result[item.text] = defaultTranslation
      })
    })
    return result
  }

  private mergeWithExistingJson(
    filePath: string,
    newData: Record<string, string>,
  ): Record<string, string> {
    try {
      // 尝试读取现有文件
      if (fs.existsSync(filePath)) {
        const existingContent = fs.readFileSync(filePath, "utf8")
        const existingData = JSON.parse(existingContent)

        // 合并数据：新数据会覆盖现有数据中的相同 key
        return { ...newData, ...existingData }
      }
    } catch (error) {
      console.warn(
        `Failed to read existing file ${filePath}, creating new file:`,
        error,
      )
    }

    // 如果文件不存在或读取失败，返回新数据
    return newData
  }
}
