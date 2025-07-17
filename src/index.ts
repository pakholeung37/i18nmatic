import { Loader } from './loader'
import * as core from './core'
import { handleParseError } from './common'
import { createLanguageCheckFunction } from './common/language'
import { Generator } from './generator'
import { Extractor } from './extractor'
import { ExtractedText } from './core/type'
import { KeyLanguage, OutputTranslation } from './type'

//TODO: 제외 경로 추가, ns 정의
interface Options {
  importFromName?: string
  keyLanguage: KeyLanguage
  locales: string[]
  outputDir: string
  include: string | string[]
  exclude?: string | string[]
  ext?: string[]
  enablePrettier: boolean
  outputFileName: string
  dry: boolean
  outputTranslation: OutputTranslation
  comment?: boolean
  defaultTranslation?: string
}

const defaultOptions: Options = {
  importFromName: 'react-i18next',
  locales: ['en_US'],
  include: 'samples',
  exclude: ['node_modules', 'dist', 'build', 'test'],
  ext: ['js', 'jsx', 'ts', 'tsx'],
  dry: false,
  outputDir: 'public/locales',
  enablePrettier: true,
  keyLanguage: 'ko',
  outputFileName: 'en_US.json',
  outputTranslation: 'create',
  comment: false,
  defaultTranslation: '',
}

export async function main(options: Options) {
  const {
    include,
    exclude,
    ext,
    locales,
    outputDir,
    importFromName,
    enablePrettier,
    outputFileName,
    keyLanguage,
    dry,
    outputTranslation,
    comment,
    defaultTranslation,
  } = { ...defaultOptions, ...options }

  const loader = new Loader({
    include: include,
    exclude: exclude,
    ext: ext,
  })

  const generator = new Generator({
    enablePrettier: enablePrettier,
    dry,
  })

  const extractedTexts: ExtractedText[] = []

  // 추후 여러 언어 동적 할당
  await loader.load((file) => {
    console.log(`Processing file: ${file.filepath}`)
    try {
      const { ast: transformAst, isChanged } = core.transform(
        file.ast,
        createLanguageCheckFunction(keyLanguage),
        importFromName || 'react-i18next',
      )

      if (isChanged) {
        generator.generate(transformAst, file.filepath)
      }

      extractedTexts.push(
        ...new Extractor(
          file.ast,
          createLanguageCheckFunction(keyLanguage),
          file.filepath,
        ).extract(),
      )
    } catch (error) {
      handleParseError(error, file.filepath)
    }
  })

  generator.generateJson(
    extractedTexts,
    locales,
    outputDir,
    outputFileName,
    outputTranslation,
    comment,
    defaultTranslation,
  )
}
