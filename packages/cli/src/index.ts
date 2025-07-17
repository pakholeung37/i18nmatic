import { Loader } from "./loader"
import * as core from "./core"
import { handleParseError } from "./common"
import { createLanguageCheckFunction } from "./common/language"
import { Generator } from "./generator"
import { Extractor } from "./extractor"
import { ExtractedText } from "./core/type"
import { KeyLanguage, OutputJsonMode } from "./type"

interface Options {
  /**
   * 指定 import from 包名, default "react-i18next"
   */
  importModuleName?: string
  /**
   * 是否使用 use hook, 如果不使用将会使用 t 函数而不是 useTranslation hook. default false
   */
  useHook?: boolean
  /**
   * 指定 key 语言, default "zh"
   */
  keyLanguage: KeyLanguage
  /**
   *
   */
  outputDir: string
  include: string | string[]
  exclude?: string | string[]
  ext?: string[]
  enablePrettier: boolean
  outputFileName: string
  dry: boolean
  outputJsonMode: OutputJsonMode
  comment?: boolean
  defaultTranslation?: string
}

const defaultOptions: Options = {
  importModuleName: "react-i18next",
  useHook: false,
  keyLanguage: "zh",
  include: "samples",
  exclude: ["node_modules", "dist", "build", "test"],
  ext: ["js", "jsx", "ts", "tsx"],
  dry: false,
  outputDir: "public/locales",
  enablePrettier: true,
  outputFileName: "en_US.json",
  outputJsonMode: "create",
  comment: false,
  defaultTranslation: "",
}

export async function main(options: Options) {
  const runtimeOptions = {
    ...defaultOptions,
    ...options,
  }
  console.log("🔧 Final Options:", runtimeOptions)

  const {
    include,
    exclude,
    ext,
    useHook,
    outputDir,
    importModuleName,
    enablePrettier,
    outputFileName,
    keyLanguage,
    dry,
    outputJsonMode,
    comment,
    defaultTranslation,
  } = runtimeOptions

  const loader = new Loader({
    include,
    exclude,
    ext,
  })

  const generator = new Generator({
    enablePrettier,
    dry,
  })

  const extractedTexts: ExtractedText[] = []
  const checkLanguage = createLanguageCheckFunction(keyLanguage)
  // 추후 여러 언어 동적 할당
  await loader.load((file) => {
    try {
      const { ast: transformAst, isChanged } = core.transform(
        file.ast,
        checkLanguage,
        importModuleName,
        useHook,
      )

      if (isChanged) {
        generator.generate(transformAst, file.filepath)
        console.log(`Transformed file: ${file.filepath}`)
      }

      extractedTexts.push(
        ...new Extractor(
          file.ast,
          checkLanguage,
          file.filepath,
        ).extract(),
      )
    } catch (error) {
      handleParseError(error, file.filepath)
    }
  })

  generator.generateJson(
    extractedTexts,
    outputDir,
    outputFileName,
    outputJsonMode,
    comment,
    defaultTranslation,
  )
}
